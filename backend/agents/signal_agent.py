import re

class SignalCollectorAgent:

    def process_signal(self, text):

        text = text.lower()

        result = {
            "location": None,
            "issue": None,
            "vehicles_stranded": False
        }

        # Detect location
        location_match = re.search(r"g-\d+", text)

        if location_match:
            result["location"] = location_match.group()

        # Detect flooding keywords
        flood_keywords = [
            "flood",
            "pani bhar gaya",
            "water",
            "flooding"
        ]

        for keyword in flood_keywords:
            if keyword in text:
                result["issue"] = "urban flooding"

        # Detect stranded vehicles
        stranded_keywords = [
            "gaariyan phans",
            "vehicles stranded",
            "cars stuck"
        ]

        for keyword in stranded_keywords:
            if keyword in text:
                result["vehicles_stranded"] = True

        return result