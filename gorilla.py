from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import openai
import json
import logging
from logging.handlers import RotatingFileHandler
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
if not os.path.exists('logs'):
    os.makedirs('logs')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Add file handler for logging
file_handler = RotatingFileHandler('logs/app.log', maxBytes=10240000, backupCount=5)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
logger.addHandler(file_handler)

# Configure OpenAI client to use Gorilla's endpoint
openai.api_key = "EMPTY"
openai.api_base = "http://luigi.millennium.berkeley.edu:8000/v1"

# Canvas-related classes and functions
@dataclass
class Position:
    x: int
    y: int

@dataclass
class Dimensions:
    width: int
    height: int

@dataclass
class Style:
    fill: str
    font: Optional[str] = None

@dataclass
class CanvasData:
    type: str
    content: str
    position: Position
    style: Style
    dimensions: Optional[Dimensions] = None

    def to_dict(self) -> Dict[str, Any]:
        result = {
            "type": self.type,
            "content": self.content,
            "position": {"x": self.position.x, "y": self.position.y},
            "style": {"fill": self.style.fill}
        }
        if self.style.font:
            result["style"]["font"] = self.style.font
        if self.dimensions:
            result["dimensions"] = {
                "width": self.dimensions.width,
                "height": self.dimensions.height
            }
        return result

def create_canvas_functions() -> List[Dict[str, Any]]:
    return [{
        "name": "create_canvas_element",
        "description": "Create a visual element (shape or text) for the canvas",
        "parameters": {
            "type": "object",
            "properties": {
                "type": {
                    "type": "string",
                    "enum": ["shape", "text"],
                    "description": "Type of canvas element"
                },
                "content": {
                    "type": "string",
                    "description": "Content of the element (shape type for shapes, text content for text)"
                },
                "position": {
                    "type": "object",
                    "properties": {
                        "x": {"type": "integer", "description": "X coordinate"},
                        "y": {"type": "integer", "description": "Y coordinate"}
                    },
                    "required": ["x", "y"]
                },
                "dimensions": {
                    "type": "object",
                    "properties": {
                        "width": {"type": "integer"},
                        "height": {"type": "integer"}
                    }
                },
                "style": {
                    "type": "object",
                    "properties": {
                        "fill": {"type": "string", "description": "Color or fill style"},
                        "font": {"type": "string", "description": "Font specification for text elements"}
                    },
                    "required": ["fill"]
                }
            },
            "required": ["type", "content", "position", "style"]
        }
    }]

def create_chart_functions() -> List[Dict[str, Any]]:
    return [{
        "name": "create_chart_data",
        "description": "Create data for various chart types (line, bar, pie, etc.)",
        "parameters": {
            "type": "object",
            "properties": {
                "chartType": {
                    "type": "string",
                    "enum": ["line", "bar", "pie", "area", "radar"],
                    "description": "Type of chart to generate"
                },
                "series": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string"},
                            "data": {
                                "type": "array",
                                "items": {"type": "number"}
                            }
                        }
                    }
                },
                "labels": {
                    "type": "array",
                    "items": {"type": "string"}
                },
                "title": {"type": "string"},
                "xaxisTitle": {"type": "string"},
                "yaxisTitle": {"type": "string"}
            },
            "required": ["chartType", "series", "title"]
        }
    }]

def parse_gorilla_response(completion_choice) -> List[CanvasData]:
    canvas_elements = []
    
    try:
        function_calls = completion_choice.message.get("function_call", [])
        if hasattr(function_calls, "arguments"):
            function_calls = [function_calls]
        
        for func_call in function_calls:
            try:
                if hasattr(func_call, "arguments") and isinstance(func_call.arguments, dict):
                    args = func_call.arguments
                elif hasattr(func_call, "arguments") and isinstance(func_call.arguments, str):
                    args = json.loads(func_call.arguments)
                else:
                    args = func_call.get("arguments", {})
                
                position = Position(
                    x=args["position"]["x"],
                    y=args["position"]["y"]
                )
                
                style = Style(
                    fill=args["style"]["fill"],
                    font=args["style"].get("font")
                )
                
                dimensions = None
                if "dimensions" in args:
                    dimensions = Dimensions(
                        width=args["dimensions"]["width"],
                        height=args["dimensions"]["height"]
                    )
                
                canvas_data = CanvasData(
                    type=args["type"],
                    content=args["content"],
                    position=position,
                    style=style,
                    dimensions=dimensions
                )
                canvas_elements.append(canvas_data)
                
            except Exception as e:
                logger.error(f"Error parsing canvas element: {str(e)}")
                continue
                
        return canvas_elements
    except Exception as e:
        logger.error(f"Error processing canvas response: {str(e)}")
        return []

def parse_chart_response(completion_choice) -> Dict[str, Any]:
    try:
        function_call = completion_choice.message.get("function_call", {})
        
        if hasattr(function_call, "arguments") and isinstance(function_call.arguments, dict):
            args = function_call.arguments
        elif hasattr(function_call, "arguments") and isinstance(function_call.arguments, str):
            args = json.loads(function_call.arguments)
        else:
            args = function_call.get("arguments", {})
        
        return {
            "chartType": args.get("chartType", "line"),
            "series": args.get("series", []),
            "title": args.get("title", ""),
            "labels": args.get("labels", []),
            "xaxisTitle": args.get("xaxisTitle", ""),
            "yaxisTitle": args.get("yaxisTitle", "")
        }
    except Exception as e:
        logger.error(f"Error parsing chart response: {str(e)}")
        return {}

@app.route('/generate', methods=['POST'])
def generate_canvas():
    if not request.is_json:
        return jsonify({"success": False, "error": "Content-Type must be application/json"}), 400
    
    data = request.get_json()
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({"success": False, "error": "Prompt is required"}), 400
    
    try:
        functions = create_canvas_functions()
        
        completion = openai.ChatCompletion.create(
            model="gorilla-openfunctions-v2",
            temperature=0.0,
            messages=[{"role": "user", "content": prompt}],
            functions=functions,
            function_call={"name": "create_canvas_element"}
        )
        
        canvas_elements = parse_gorilla_response(completion.choices[0])
        
        if not canvas_elements:
            return jsonify({
                "success": False,
                "error": "Failed to generate canvas elements"
            }), 422
        
        response_data = [element.to_dict() for element in canvas_elements]
        
        return jsonify({
            "success": True,
            "data": response_data
        })
        
    except Exception as e:
        logger.error(f"Error in generate_canvas: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/generate-chart', methods=['POST'])
def generate_chart():
    if not request.is_json:
        return jsonify({"success": False, "error": "Content-Type must be application/json"}), 400
    
    data = request.get_json()
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({"success": False, "error": "Prompt is required"}), 400
    
    try:
        functions = create_chart_functions()
        
        completion = openai.ChatCompletion.create(
            model="gorilla-openfunctions-v2",
            temperature=0.0,
            messages=[{
                "role": "user",
                "content": f"Generate chart data for: {prompt}. Include meaningful labels and titles."
            }],
            functions=functions,
            function_call={"name": "create_chart_data"}
        )
        
        chart_data = parse_chart_response(completion.choices[0])
        
        if not chart_data:
            return jsonify({
                "success": False,
                "error": "Failed to generate chart data"
            }), 422
        
        return jsonify({
            "success": True,
            "data": chart_data
        })
        
    except Exception as e:
        logger.error(f"Error in generate_chart: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)