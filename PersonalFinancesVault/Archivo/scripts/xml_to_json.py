import xmltodict
import re
from bs4 import BeautifulSoup
import json


class Node:
    id = None
    value = None
    type = None
    target = None
    source = None

    def __init__(self, cell: dict):
        self.id = self.id = cell.get("@id")
        self.value = self.get_value(cell)
        self.type = self.get_type(cell)
        if self.type == "arrow":
            self.target = cell.get("@target")
            self.source = cell.get("@source")

    def get_type(self, cell):
        def regex_helper(string, regex):
            match = re.search(regex, string)
            if match:
                return match.group(1)
            return None

        types_by_color = {
            "fff2cc": "action",
            "dae8fc": "question",
            "d5e8d4": "title",
            "f8cecc": "endpoint",
            "e1d5e7": "definition",
        }

        if style := cell.get("@style"):
            if cell.get("@target") is not None:
                return "arrow"
            color = regex_helper(style, r"fillColor=#([0-9a-fA-F]{6});")
            type = types_by_color.get(color)
            return type

    def get_value(self, cell):
        value = cell.get("@value") or ""
        try:
            soup = BeautifulSoup(value, "html.parser")
            return soup.get_text()
        except Exception as e:
            print(e)
        return value

    def get(self):
        if self.type is None:
            return None
        elif self.type == "arrow":
            return {
                "id": self.id,
                "type": self.type,
                "value": self.value,
                "target": self.target,
                "source": self.source,
            }
        else:
            return {
                "id": self.id,
                "type": self.type,
                "value": self.value,
            }


class Nodes:
    nodes = []
    data = {}

    def __init__(self, cells):
        self.get_nodes(cells)
        self.new_ids()
        self.sort_by_type()
        self.sanitize()

    def get_nodes(self, cells):
        nodes = []
        for cell in cells:
            node = Node(cell)
            if node.type is not None:
                nodes.append(node.__dict__)
        self.nodes = nodes

    def new_ids(self):
        count_by_type = {}
        for node in self.nodes:
            type = node["type"]
            if type not in count_by_type:
                count_by_type[type] = 0
            count_by_type[type] += 1
            node["old_id"] = node["id"]
            node["id"] = f"{type}_{count_by_type[type]}"

        arrow_nodes = list(filter(lambda node: node["type"] == "arrow", self.nodes))

        for node in arrow_nodes:
            new_target = list(
                filter(lambda n: n["old_id"] == node["target"], self.nodes)
            )[0]
            new_source = list(
                filter(lambda n: n["old_id"] == node["source"], self.nodes)
            )[0]
            self.nodes[self.nodes.index(node)]["target"] = new_target["id"]
            self.nodes[self.nodes.index(node)]["source"] = new_source["id"]

    def sort_by_type(self):
        for node in self.nodes:
            type = node["type"]
            if type not in self.data:
                self.data[type] = []
            self.data[type].append(node)

    def sanitize(self):
        for node in self.nodes:
            del node["old_id"]

    def get(self):
        return self.data


class IO:
    xml_file = None
    json_file = None

    def __init__(self, xml_file, json_file):
        self.xml_file = xml_file
        self.json_file = json_file

    def read(self):
        with open(self.xml_file) as xml_file:
            data_dict = xmltodict.parse(xml_file.read())
            xml_file.close()
            return data_dict

    def write(self, data):
        with open(self.json_file, "w") as json_file:
            json.dump(str(data), json_file)


def run():
    input_file_name = "drawio.xml"
    output_file_name = "data.json"
    io = IO(input_file_name, output_file_name)
    data_dict = io.read()
    cells = data_dict["mxfile"]["diagram"]["mxGraphModel"]["root"]["mxCell"]
    nodes = Nodes(cells).get()
    io.write(nodes)


run()
