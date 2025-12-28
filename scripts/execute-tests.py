import time
import subprocess
import os

timestamp = time.strftime("%Y%m%d_%H%M%S")

results_dir = f"results/run_{timestamp}"
os.makedirs(results_dir, exist_ok=True)

command = [
    "robot",
    "--outputdir", results_dir,
    "--report", f"report_{timestamp}.html",
    "--log", f"log_{timestamp}.html",
    "--output", f"output_{timestamp}.xml",
    "--variable", "HEADLESS:true",
    "tests"
]

subprocess.run(command, check=True)