class CrisisDetectionAgent:

    def analyze(self, signal_data, weather, traffic):

        text = signal_data["text"].lower()

        # 🧠 Crisis scoring system
        scores = {
            "flood": 0,
            "traffic": 0,
            "protest": 0,
            "accident": 0,
            "fire": 0
        }

        # keyword detection
        if "flood" in text or "rain" in text:
            scores["flood"] += 0.7

        if "traffic" in text or "jam" in text:
            scores["traffic"] += 0.6

        if "protest" in text or "blocked" in text:
            scores["protest"] += 0.9

        if "accident" in text:
            scores["accident"] += 0.8

        if "fire" in text:
            scores["fire"] += 0.9

        # contextual boost
        if traffic == "high congestion":
            scores["traffic"] += 0.2

        if weather == "heavy rainfall":
            scores["flood"] += 0.2

        # 🎯 determine best crisis
        event = max(scores, key=scores.get)
        confidence = scores[event]

        # 🎯 severity logic
        if confidence > 1.0:
            severity = "HIGH"
            emergency_level = 3
        elif confidence > 0.6:
            severity = "MEDIUM"
            emergency_level = 2
        else:
            severity = "LOW"
            emergency_level = 1

        return {
            "event": event,
            "severity": severity,
            "confidence": round(confidence, 2),
            "emergency_level": emergency_level,
            "reasons": self._generate_reasons(text, weather, traffic)
        }

    def _generate_reasons(self, text, weather, traffic):

        reasons = []

        if "protest" in text:
            reasons.append("Public protest detected in input")

        if "blocked" in text:
            reasons.append("Road blockage reported")

        if "rain" in text:
            reasons.append("Weather indicates rainfall")

        if "traffic" in text:
            reasons.append("Traffic congestion signals present")

        return reasons