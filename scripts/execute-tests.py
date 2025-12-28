import time
import subprocess
import os
import sys
import shutil

# Creación de timestamp
timestamp = time.strftime("%Y%m%d_%H%M%S")

# Definir nombres de archivos
report_file = f"report_{timestamp}.html"
log_file = f"log_{timestamp}.html"
output_file = f"output_{timestamp}.xml"

# Definir directorios
results_dir = f"results/run_{timestamp}"
docs_dir = "docs"

os.makedirs(results_dir, exist_ok=True)
os.makedirs(docs_dir, exist_ok=True)

# BASE_URL por defecto para pruebas en local
base_url = "http://127.0.0.1:5500"

# Leer argumento desde CLI (CI)
for arg in sys.argv:
    if arg.startswith("--base-url="):
        base_url = arg.split("=", 1)[1]

# Ejecutar Robot Framework
command = [
    "robot",
    "--outputdir", results_dir,
    "--variable", f"BASE_URL:{base_url}",
    "--report", report_file,
    "--log", log_file,
    "--output", output_file,
    "--variable", "HEADLESS:true",
    "tests"
]

subprocess.run(command, check=True)

# Copiar a docs/ para GitHub Pages
shutil.copy(f"{results_dir}/{report_file}", f"{docs_dir}/index.html")
shutil.copy(f"{results_dir}/{log_file}", f"{docs_dir}/log.html")
shutil.copy(f"{results_dir}/{output_file}", f"{docs_dir}/output.xml")