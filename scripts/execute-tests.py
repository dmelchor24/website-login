import time
import subprocess
import os
import sys

timestamp = time.strftime("%Y%m%d_%H%M%S")

results_dir = f"results/run_{timestamp}"
os.makedirs(results_dir, exist_ok=True)

# Valor por defecto (local)
base_url = "http://127.0.0.1:5500"

# Leer argumento si viene de CI
for arg in sys.argv:
    if arg.startswith("--base-url="):
        base_url = arg.split("=", 1)[1]

command = [
    "robot",
    "--outputdir", results_dir,
    "--variable", f"BASE_URL:{base_url}",
    "--report", f"report_{timestamp}.html",
    "--log", f"log_{timestamp}.html",
    "--output", f"output_{timestamp}.xml",
    "--variable", "HEADLESS:true",
    "tests"
]

subprocess.run(command, check=True)