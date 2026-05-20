import requests
import json
import re


class LLMCrisisDetectionAgent:

    def __init__(self):
        self.ollama_url = "http://localhost:11434/api/generate"
        self.model = "mistral"

    # -------------------------
    # RULE-BASED FALLBACK ENGINE
    # -------------------------
    def rule_based_detection(self, text):

        text_lower = text.lower()

        if any(word in text_lower for word in ["flood", "rain", "water", "river overflow"]):
            return "flood", "HIGH"

        if any(word in text_lower for word in ["protest", "strike", "rally", "march"]):
            return "protest", "HIGH"

        if any(word in text_lower for word in ["fire", "smoke", "burning"]):
            return "fire", "HIGH"

        if any(word in text_lower for word in ["accident", "crash", "collision"]):
            return "accident", "MEDIUM"

        if any(word in text_lower for word in ["earthquake", "tremor", "quake"]):
            return "earthquake", "HIGH"

        if any(word in text_lower for word in ["traffic", "jam", "blocked"]):
            return "traffic", "LOW"

        return "unknown", "LOW"

    # -------------------------
    # SAFE JSON PARSER
    # -------------------------
    def safe_json_parse(self, text):
        try:
            return json.loads(text)
        except:
            match = re.search(r"\{.*\}", text, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group())
                except:
                    return None
        return None

    # -------------------------
    # MAIN ANALYSIS
    # -------------------------
    def analyze(self, input_text):

        prompt = f"""
Return ONLY valid JSON.

Detect emergency event.

Format:
{{
  "event": "",
  "severity": "",
  "confidence": 0.0,
  "emergency_level": 1,
  "reasons": []
}}

Text:
{input_text}
"""

        try:
            response = requests.post(
                self.ollama_url,
                json={
                    "model": self.model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=25
            )

            result = response.json()["response"].strip()
            parsed = self.safe_json_parse(result)

            # -------------------------
            # IF LLM FAILS → USE RULES
            # -------------------------
            if not parsed:
                event, severity = self.rule_based_detection(input_text)

                return {
                    "event": event,
                    "severity": severity,
                    "confidence": 0.6,
                    "emergency_level": 3 if severity == "HIGH" else 1,
                    "reasons": ["rule-based fallback used"]
                }

            # -------------------------
            # ENSURE VALID EVENT ALWAYS
            # -------------------------
            if not parsed.get("event") or parsed.get("event") == "unknown":
                event, severity = self.rule_based_detection(input_text)
                parsed["event"] = event
                parsed["severity"] = severity

            return parsed

        except Exception:
            event, severity = self.rule_based_detection(input_text)

            return {
                "event": event,
                "severity": severity,
                "confidence": 0.5,
                "emergency_level": 2,
                "reasons": ["exception fallback used"]
            }