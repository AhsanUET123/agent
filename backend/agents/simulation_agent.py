import random

class SimulationAgent:

    def run_simulation(self, action_plan, crisis_data):

        actions = action_plan.get("actions", [])
        priority = action_plan.get("priority", "NORMAL")

        # Base traffic level (0 to 1)
        traffic_before = round(random.uniform(0.7, 0.95), 2)

        # Default outcomes
        traffic_after = traffic_before
        alerts_sent = False
        rescue_dispatched = False

        # Simulate based on actions
        if "Reroute traffic away from affected area" in actions:
            traffic_after -= 0.3

        if "Send flood alert notification to citizens" in actions:
            alerts_sent = True

        if "Dispatch emergency rescue team" in actions:
            rescue_dispatched = True
            traffic_after -= 0.1

        if "Notify municipal disaster authority" in actions:
            traffic_after -= 0.05

        # Clamp values between 0 and 1
        traffic_after = max(0.1, min(1.0, round(traffic_after, 2)))

        # Determine system status
        if traffic_after < 0.5:
            status = "IMPROVED"
        else:
            status = "CRITICAL"

        return {
            "simulation": {
                "traffic_before": traffic_before,
                "traffic_after": traffic_after,
                "alerts_sent": alerts_sent,
                "rescue_dispatched": rescue_dispatched,
                "status": status
            }
        }