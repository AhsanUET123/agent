from agents.signal_agent import SignalCollectorAgent
from agents.action_planner_agent import ActionPlannerAgent
from agents.simulation_agent import SimulationAgent
from agents.notification_agent import NotificationAgent
from agents.geolocation_agent import GeoLocationAgent
from agents.llm_crisis_agent import LLMCrisisDetectionAgent


class CIROOrchestrator:

    def __init__(self):
        self.signal_agent = SignalCollectorAgent()
        self.crisis_agent = LLMCrisisDetectionAgent()
        self.planner_agent = ActionPlannerAgent()
        self.simulation_agent = SimulationAgent()
        self.notification_agent = NotificationAgent()
        self.geo_agent = GeoLocationAgent()

    def run_pipeline(self, input_text):

        context = {
            "input": input_text,
            "signal": {},
            "geo": {},
            "crisis": {},
            "actions": [],
            "simulation": {},
            "alerts": []
        }

        # 1️⃣ Signal
        print("\n[1] SIGNAL COLLECTION")
        context["signal"] = self.signal_agent.process_signal(input_text)
        print(context["signal"])

        # 2️⃣ Geo
        print("\n[2] GEO LOCATION ANALYSIS")
        context["geo"] = self.geo_agent.get_coordinates(input_text)
        print(context["geo"])

        # FIX: unify location early
        context["signal"]["location"] = context["geo"].get("location")
        context["signal"]["coords"] = context["geo"].get("coords")

        # 3️⃣ LLM
        print("\n[3] LLM CRISIS DETECTION")
        context["crisis"] = self.crisis_agent.analyze(input_text)

        # attach geo safely
        context["crisis"]["location_data"] = context["geo"]

        print(context["crisis"])

        # 4️⃣ Actions
        print("\n[4] ACTION PLANNING")
        context["actions"] = self.planner_agent.plan_actions(context)
        print(context["actions"])

        # 5️⃣ Simulation
        print("\n[5] SIMULATION")
        context["simulation"] = self.simulation_agent.run_simulation(
            context["actions"],
            context["crisis"]
        )
        print(context["simulation"])

        # 6️⃣ Notifications
        print("\n[6] NOTIFICATIONS")
        context["alerts"] = self.notification_agent.generate_alerts(
            context,
            context["actions"]
        )
        print(context["alerts"])

        return context