class ActionPlannerAgent:

    def plan_actions(self, crisis_data):

        event = crisis_data.get("event")
        severity = crisis_data.get("severity")
        actions = []

        # HIGH SEVERITY CASE
        if severity == "HIGH":

            if "Flood" in event:
                actions.append("Reroute traffic away from affected area")
                actions.append("Dispatch emergency rescue team")
                actions.append("Send flood alert notification to citizens")
                actions.append("Notify municipal disaster authority")

            else:
                actions.append("Activate emergency response protocol")

            priority = "IMMEDIATE"

        # MEDIUM SEVERITY CASE
        elif severity == "MEDIUM":

            actions.append("Monitor situation in real-time")
            actions.append("Prepare emergency teams on standby")
            actions.append("Send precautionary alerts")

            priority = "HIGH"

        # LOW SEVERITY CASE
        else:

            actions.append("Log incident for monitoring")
            actions.append("Continue surveillance")

            priority = "NORMAL"

        return {
            "actions": actions,
            "priority": priority
        }