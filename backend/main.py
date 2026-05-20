from orchestrator.ciro_orchestrator import CIROOrchestrator

orchestrator = CIROOrchestrator()

input_text = "G-10 mein pani bhar gaya hai aur gaariyan phans gayi hain"

result = orchestrator.run_pipeline(input_text)

print("\n=== FINAL SYSTEM OUTPUT ===")
print(result)