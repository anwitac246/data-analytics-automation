import nbformat
import os

os.makedirs("backend/notebooks", exist_ok=True)

nb = nbformat.v4.new_notebook()
nb.cells = [
    nbformat.v4.new_code_cell(
        source=(
            "# Your analysis code here\n"
            "print(f\"Analyzing file: {input_file}\")\n"
            "import json\n"
            "summary = {\n"
            "    \"info\": f\"This is dummy output after analyzing {input_file}\"\n"
            "}\n"
            "with open(output_json, \"w\") as f:\n"
            "    json.dump(summary, f, indent=2)\n"
            "print(f\"Results written to {output_json}\")"
        )
    )
]

with open("backend/notebooks/test_analysis.ipynb", "w") as f:
    nbformat.write(nb, f)

print("✅ test_analysis.ipynb created successfully.")
