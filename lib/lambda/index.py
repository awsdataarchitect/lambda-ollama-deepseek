import json
import os
import subprocess

def lambda_handler(event, context):
    try:

        model = os.getenv("OLLAMA_MODEL", "deepseek-r1:1.5b")
        print("model: ", model)
     
        binary_path = "/mnt/bin/ollama"
                 
        # Retrieve the prompt from the event body.
        body = json.loads(event.get("body", "{}"))
        prompt = body.get("prompt", "Hello, World!")
        print("prompt: ", prompt)
        
        # Run the model with the provided prompt.
        process = subprocess.Popen(
            [binary_path, "run", model, prompt],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        output, err = process.communicate()
        
        if process.returncode != 0:
            return {
                "statusCode": 500,
                "body": json.dumps({"error": err.decode("utf-8")})
            }
        
        print("model responded")
        
        return {
            "statusCode": 200,
            "body": json.dumps({"response": output.decode("utf-8")})
        }
    
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }