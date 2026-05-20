class GeoLocationAgent:

    def __init__(self):

        # Major cities + key areas in Pakistan
        self.locations = {
            "islamabad": {"lat": 33.6844, "lng": 73.0479},
            "rawalpindi": {"lat": 33.5651, "lng": 73.0169},
            "lahore": {"lat": 31.5204, "lng": 74.3587},
            "karachi": {"lat": 24.8607, "lng": 67.0011},
            "peshawar": {"lat": 34.0151, "lng": 71.5249},
            "quetta": {"lat": 30.1798, "lng": 66.9750},
            "multan": {"lat": 30.1575, "lng": 71.5249},

            # Islamabad sectors (optional fine detail)
            "g-10": {"lat": 33.6844, "lng": 73.0479},
            "g-11": {"lat": 33.6890, "lng": 73.0500},
            "f-10": {"lat": 33.6931, "lng": 73.0650},
        }

    def get_coordinates(self, text):

        text = text.lower()

        for key in self.locations:
            if key in text:
                return {
                    "location": key,
                    "coords": self.locations[key]
                }

        # fallback if unknown location
        return {
            "location": "unknown",
            "coords": {"lat": 0, "lng": 0}
        }