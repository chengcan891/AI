"""Read AG60 Android XML resources and index their appearance definitions and uses."""

import argparse
from collections import Counter
import json
from pathlib import Path
import re
import subprocess
import xml.etree.ElementTree as ET


RESOURCE_DIRS = {"layout", "values", "drawable", "color"}
VALUE_TYPES = {"style", "color", "dimen", "attr", "declare-styleable", "drawable"}
TOOLS_NS = "{http://schemas.android.com/tools}"
REFERENCE = re.compile(r"[@?](?:[\w.]+:)?[\w]+/[\w.]+")
APPEARANCE = re.compile(
    r"style|theme|background|foreground|colou?r|tint|alpha|font|gravity|"
    r"padding|margin|orientation|layout_|width|height|text(?:Size|Appearance|Style|Alignment)|"
    r"lines|ellipsize|drawable|stroke|corner|radius|elevation|indicator|selector|icon|src",
    re.IGNORECASE,
)


def name(key):
    return key.rsplit("}", 1)[-1]


def appearance(node):
    return {
        key: value for key, value in node.attrib.items()
        if not key.startswith(TOOLS_NS)
        and (APPEARANCE.search(name(key)) or name(key) in {"id", "layout", "visibility"})
    }


def resource_tree(node):
    return {
        "tag": name(node.tag),
        "attributes": node.attrib,
        "value": (node.text or "").strip(),
        "children": [resource_tree(child) for child in node],
    }


def layout_tree(node):
    return {
        "tag": name(node.tag),
        "appearance": appearance(node),
        "children": [layout_tree(child) for child in node],
    }


def index(root):
    listed = subprocess.check_output(
        ["rg", "--files", "-g", "*.xml", "-g", "!**/build/**"],
        cwd=root,
        encoding="utf-8",
    ).splitlines()
    for file in sorted(listed):
        path = Path(file)
        directory = path.parent.name.split("-", 1)[0]
        if directory not in RESOURCE_DIRS or path.parent.parent.name != "res":
            continue
        source = path.as_posix()
        try:
            document = ET.parse(root / path).getroot()
        except ET.ParseError as error:
            yield {"kind": "parse_error", "path": source, "error": str(error)}
            continue
        if directory == "values":
            for item in document:
                kind = item.get("type") if item.tag == "item" else item.tag
                if kind in VALUE_TYPES:
                    yield {"kind": kind, "path": source, "name": item.get("name"), **resource_tree(item)}
        elif directory == "layout":
            references = set()
            for node in document.iter():
                for value in appearance(node).values():
                    references.update(REFERENCE.findall(value))
            yield {
                "kind": directory, "path": source, "name": path.stem,
                "references": sorted(references), "layout": layout_tree(document),
            }
        else:
            yield {"kind": directory, "path": source, "name": path.stem, **resource_tree(document)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--output", type=Path, help="Write the complete index as JSONL")
    parser.add_argument("--find", help="Find a resource, layout, or reference by substring")
    parser.add_argument("--limit", type=int, default=20)
    args = parser.parse_args()
    records = list(index(args.root))
    if args.output:
        with args.output.open("w", encoding="utf-8", newline="\n") as output:
            for record in records:
                output.write(json.dumps(record, ensure_ascii=False) + "\n")
    if args.find:
        term = args.find.casefold()
        matches = [
            record for record in records
            if term in json.dumps(record, ensure_ascii=False).casefold()
        ]
        for record in matches[:args.limit]:
            print(record["kind"], record["path"], record.get("name", ""))
        print(f"matches: {len(matches)}")
    else:
        print(json.dumps(dict(sorted(Counter(row["kind"] for row in records).items()))))
    for record in records:
        if record["kind"] == "parse_error":
            print(record["path"], record["error"])


if __name__ == "__main__":
    main()
