import os
from typing import Optional

def load_schedule() -> Optional[str]:
    """Load the team schedule if it exists."""
    schedule_path = os.path.join(os.path.dirname(__file__), 'schedule.md')
    
    if os.path.exists(schedule_path):
        with open(schedule_path, 'r', encoding='utf-8') as f:
            return f.read()
    return None

def get_schedule_context(game_date: str = None) -> str:
    """Get schedule context, optionally filtered by date."""
    schedule = load_schedule()
    
    if not schedule:
        return ""
    
    context = "\n\nTEAM SCHEDULE:\n" + schedule
    
    if game_date:
        context += f"\n\nNote: This game is on or around {game_date}. Check the schedule for context about rivalry games, league importance, and upcoming matchups."
    
    return context
