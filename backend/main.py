from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from datetime import datetime
from typing import Optional, List
import hashlib
import json
import os
import secrets
import base64
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)
DATA_FILE = DATA_DIR / "playirl.json"
MEMORY_DATA = None
GITHUB_REPO = os.getenv("GITHUB_REPO", "Shreyaa44/PlayIRL_")
GITHUB_PATH = os.getenv("GITHUB_DATA_PATH", "backend/data/playirl.json")
GITHUB_BRANCH = os.getenv("GITHUB_BRANCH", "main")

app = FastAPI(title="PlayIRL API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo images. Replace these URLs with your own café photos later if required.
CAFES = [
    {"id":1,"name":"Next Level Gaming Café","area":"Vile Parle","city":"Mumbai","rating":4.8,"price":180,"gpu":"RTX 4070","cpu":"Ryzen 7 7800X3D","ram":"32 GB","seats":28,"games":["Valorant","CS2","GTA V","EA FC 26","Free Fire","Apex Legends","Among Us","Fifa","BGMI","Granny","Phasmophobia"],"tag":"Esports Ready","description":"Competitive-ready PCs, fast peripherals and a social esports atmosphere.","image":"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85"},
    {"id":2,"name":"The Gaming Lounge","area":"Andheri West","city":"Mumbai","rating":4.7,"price":150,"gpu":"RTX 4060","cpu":"Intel i7-13700F","ram":"32 GB","seats":34,"games":["Valorant","CS2","GTA V","Fortnite","Dota 2","Free Fire","Among Us"],"tag":"Popular","description":"Large multiplayer floor with private corners for squads and watch parties.","image":"https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=85"},
    {"id":3,"name":"Circle Gaming Arena","area":"Bandra","city":"Mumbai","rating":4.9,"price":220,"gpu":"RTX 4080","cpu":"Ryzen 9 7950X","ram":"64 GB","seats":20,"games":["Cyberpunk 2077","Valorant","CS2","GTA V","Elden Ring","Phasmophobia","BGMI","Granny"],"tag":"Premium","description":"High-end rigs, immersive peripherals and private seating for major events.","image":"https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?auto=format&fit=crop&w=1200&q=85"},
    {"id":4,"name":"Pixel Pit Gaming","area":"Powai","city":"Mumbai","rating":4.6,"price":130,"gpu":"RTX 3060 Ti","cpu":"Ryzen 5 7600","ram":"16 GB","seats":40,"games":["Valorant","CS2","Minecraft","GTA V","Rocket League","Among Us","BGMI","Fifa"],"tag":"Squad Friendly","description":"Affordable gaming sessions with flexible squad seating.","image":"https://images.unsplash.com/photo-1603481546238-487240415921?auto=format&fit=crop&w=1200&q=85"},
    {"id":5,"name":"Respawn Social","area":"Goregaon","city":"Mumbai","rating":4.5,"price":120,"gpu":"RTX 3060","cpu":"Intel i5-13400F","ram":"16 GB","seats":36,"games":["Valorant","CS2","EA FC 26","GTA V","Overwatch 2","Fifa","Phasmophobia","Granny"],"tag":"Budget Pick","description":"A community-first café with affordable hourly gaming.","image":"https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1200&q=85"},
    {"id":6,"name":"Arcade District","area":"Thane","city":"Thane","rating":4.7,"price":160,"gpu":"RTX 4070 Super","cpu":"Intel i7-14700F","ram":"32 GB","seats":30,"games":["Valorant","CS2","GTA V","Apex Legends","Tekken 8","Free Fire","Granny","BGMI","Fifa"],"tag":"Events","description":"Gaming café with regular community nights and tournament events.","image":"https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?auto=format&fit=crop&w=1200&q=85"},
    {"id":7,"name":"Neon Grid Gaming","area":"Kothrud","city":"Pune","rating":4.8,"price":145,"gpu":"RTX 4060 Ti","cpu":"Ryzen 7 7700","ram":"32 GB","seats":32,"games":["Valorant","CS2","GTA V","Apex Legends","Fortnite"],"tag":"Pune Hotspot","description":"Neon-lit competitive floor built for squads and late-night sessions.","image":"https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=85"},
    {"id":8,"name":"Bangalore Game House","area":"Indiranagar","city":"Bengaluru","rating":4.9,"price":190,"gpu":"RTX 4070 Super","cpu":"Ryzen 7 7800X3D","ram":"32 GB","seats":36,"games":["Valorant","CS2","GTA V","EA FC 26","Dota 2","Fifa","Phasmophobia","Among Us"],"tag":"Bengaluru Arena","description":"High-performance rigs and team-ready seating in the heart of Bengaluru.","image":"banglore.png"},
    {"id":9,"name":"Hyderabad Respawn","area":"Madhapur","city":"Hyderabad","rating":4.6,"price":140,"gpu":"RTX 4060","cpu":"Intel i7-12700F","ram":"32 GB","seats":30,"games":["Valorant","CS2","GTA V","Free Fire","Rocket League","Tekken 8","Among Us","Granny","BGMI"],"tag":"Hyderabad Play","description":"Community-focused gaming space with team tables and weekend events.","image":"gaming.png"},
    {"id":10,"name":"Chennai Battle Station","area":"T Nagar","city":"Chennai","rating":4.5,"price":125,"gpu":"RTX 3060","cpu":"Ryzen 5 5600X","ram":"16 GB","seats":28,"games":["Valorant","CS2","GTA V","Minecraft","Free Fire","EA FC 26"],"tag":"Community Pick","description":"Affordable PCs and a friendly multiplayer setup for casual and competitive players.","image":"https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=1200&q=85"},
    {
    "id": 11,
    "name": "Aim Gaming Cafe",
    "area": "Nana Chowk",
    "city": "Mumbai",
    "rating": 4.4,
    "price": 150,
    "gpu": "NVIDIA RTX 30 Series",
    "cpu": "High-refresh gaming PC",
    "ram": "Not listed",
    "seats": 30,
    "games": [
        "Valorant",
        "CS2",
        "Dota 2",
        "GTA V",
        "Fortnite",
        "Red Dead Redemption 2"
    ],
    "tag": "24/7 Esports",
    "description": "24/7 gaming arena with high-refresh PC gaming, PS5 stations, racing simulators and tournament infrastructure.",
    "image": "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=85"
},

{
    "id": 12,
    "name": "GameCraft Gaming Cafe",
    "area": "Andheri West",
    "city": "Mumbai",
    "rating": 4.6,
    "price": 100,
    "gpu": "RTX 4060",
    "cpu": "Not listed",
    "ram": "Not listed",
    "seats": 20,
    "games": [
        "GTA V",
        "Valorant",
        "Dota 2",
        "Call of Duty",
        "Minecraft",
        "CS2"
    ],
    "tag": "Esports Cafe",
    "description": "Gaming café in Andheri West with high-performance PCs, PS5 consoles, racing simulators and a large game library.",
    "image": "https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1200&q=85"
},

{
    "id": 13,
    "name": "VGS Esports",
    "area": "Bandra West",
    "city": "Mumbai",
    "rating": 4.9,
    "price": 60,
    "gpu": "High-performance PCs",
    "cpu": "Not listed",
    "ram": "Not listed",
    "seats": 30,
    "games": [
        "Fortnite",
        "Dota 2",
        "Valorant",
        "CS2",
        "GTA V",
        "EA FC 26"
    ],
    "tag": "Bandra Esports",
    "description": "Gaming café offering PC and PlayStation gaming in Pali Village, Bandra West.",
    "image": "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=1200&q=85"
},
]

TOURNAMENTS = [
    {
        "id": 1,
        "title": "Mumbai Valorant Night",
        "game": "Valorant",
        "date": "Oct 04, 2026",
        "prize": "₹3,500",
        "spots": 25,
        "type": "LAN",
        "image": "valorant.png"
    },
    {
        "id": 2,
        "title": "CS2 Squad Clash",
        "game": "Counter-Strike 2",
        "date": "Oct 11, 2026",
        "prize": "₹40,000",
        "spots": 20,
        "type": "LAN",
        "image": "c2c.avif"
    },
    {
        "id": 3,
        "title": "EA FC Weekend Cup",
        "game": "EA FC 26",
        "date": "Oct 18, 2026",
        "prize": "₹15,000",
        "spots": 16,
        "type": "Console + PC",
        "image": "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?auto=format&fit=crop&w=1200&q=85"
    },
    {
            "id": 4,
            "title": "BGMI Esports",
            "game": "BGMI",
            "date": "Oct 30, 2026",
            "prize": "₹7000",
            "spots": 12,
            "type": "PC",
            "image": "bgmi.jpg"
        },
        {
                "id": 5,
                "title": "Among Us Night",
                "game": "Among Us",
                "date": "Nov 8, 2026",
                "prize": "₹3000",
                "spots": 25,
                "type": "PC",
                "image": "amongus.png"
            },
]

DEFAULT_DATA = {"users": [{"id":1,"name":"Aalu","email":"demo@playirl.local","password_hash":hashlib.sha256(b"demo1234").hexdigest(),"plan":"free","points":1250}], "bookings": []}


def save_data(data):
    global MEMORY_DATA
    encoded = json.dumps(data, indent=2, ensure_ascii=False).encode("utf-8")
    token = os.getenv("GITHUB_TOKEN")
    if not token:
        try:
            DATA_FILE.write_bytes(encoded)
        except OSError:
            # Vercel's filesystem is read-only; keep demo submissions alive
            # for warm serverless instances when no database is configured.
            MEMORY_DATA = json.loads(encoded.decode("utf-8"))
        return

    api_url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_PATH}"
    headers = {
        "Accept": "application/vnd.github+json",
        "Authorization": f"Bearer {token}",
        "User-Agent": "PlayIRL-api",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    current_request = Request(f"{api_url}?ref={GITHUB_BRANCH}", headers=headers)
    try:
        with urlopen(current_request, timeout=10) as response:
            current = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, json.JSONDecodeError) as error:
        raise RuntimeError("Could not read the production JSON store") from error

    payload = json.dumps({
        "message": "Update PlayIRL data",
        "content": base64.b64encode(encoded).decode("ascii"),
        "sha": current["sha"],
        "branch": GITHUB_BRANCH,
    }).encode("utf-8")
    try:
        with urlopen(Request(api_url, data=payload, headers={**headers, "Content-Type": "application/json"}, method="PUT"), timeout=10):
            return
    except (HTTPError, URLError, KeyError) as error:
        raise RuntimeError("Could not save the production JSON store") from error


def load_data():
    if MEMORY_DATA is not None:
        return json.loads(json.dumps(MEMORY_DATA))
    token = os.getenv("GITHUB_TOKEN")
    if token:
        api_url = f"https://api.github.com/repos/{GITHUB_REPO}/contents/{GITHUB_PATH}?ref={GITHUB_BRANCH}"
        request = Request(api_url, headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "User-Agent": "PlayIRL-api",
            "X-GitHub-Api-Version": "2022-11-28",
        })
        try:
            with urlopen(request, timeout=10) as response:
                remote = json.loads(response.read().decode("utf-8"))
            return json.loads(base64.b64decode(remote["content"]).decode("utf-8"))
        except (HTTPError, URLError, json.JSONDecodeError, KeyError, ValueError) as error:
            raise RuntimeError("Could not read the production JSON store") from error

    if not DATA_FILE.exists():
        save_data(DEFAULT_DATA)
    try:
        data = json.loads(DATA_FILE.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        save_data(DEFAULT_DATA)
        data = json.loads(json.dumps(DEFAULT_DATA))

    # Small migration for the original JSON file created by the previous version.
    changed = False
    week_key = current_week_key()
    for user in data.get("users", []):
        if not user.get("password_hash"):
            user["password_hash"] = hash_password("demo1234")
            changed = True
        if "weekly_points" not in user:
            user["weekly_points"] = 0
            changed = True
        if user.get("week_key") != week_key:
            user["weekly_points"] = 0
            user["week_key"] = week_key
            changed = True
    if changed:
        save_data(data)
    return data


def next_id(items):
    return max((x.get("id", 0) for x in items), default=0) + 1


def hash_password(password: str):
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def current_week_key():
    # ISO week: the leaderboard starts a new week every Monday.
    return datetime.now().strftime("%G-W%V")


class AuthIn(BaseModel):
    email: str
    password: str
    name: Optional[str] = None


class BookingIn(BaseModel):
    user_id: int
    cafe_id: int
    game: str
    booking_date: str
    booking_time: str
    seats: int = 1
    seat_numbers: List[int] = []
    booking_type: str = "solo"
    duo_players: List[str] = []
    food: bool = False
    beverage: bool = False
    discount_percent: float = 0
    extra_minutes: int = 0


class CancelIn(BaseModel):
    user_id: int


class PlanIn(BaseModel):
    user_id: int
    plan: str
class ResetPasswordIn(BaseModel):
    email: str
    new_password: str
class TournamentReservationIn(BaseModel):
    user_id: int
    tournament_id: int
    seats: int = 1


@app.get("/api/health")
def health():
    return {"status":"ok", "service":"PlayIRL", "storage":"JSON file"}


@app.get("/api/cities")
def cities():
    return sorted({c["city"] for c in CAFES})


@app.get("/api/cafes")
def cafes(area: Optional[str] = None, game: Optional[str] = None, city: Optional[str] = None):
    result = CAFES
    if city:
        result = [c for c in result if c["city"].lower() == city.lower()]
    if area:
        result = [c for c in result if area.lower() in c["area"].lower()]
    if game:
        result = [c for c in result if any(game.lower() in g.lower() for g in c["games"])]
    return result


@app.get("/api/cafes/{cafe_id}")
def cafe(cafe_id: int):
    item = next((c for c in CAFES if c["id"] == cafe_id), None)
    if not item:
        raise HTTPException(404, "Café not found")
    return item


@app.get("/api/tournaments")
def tournaments():
    return TOURNAMENTS
@app.post("/api/tournament-reservations")
def reserve_tournament_seats(payload: TournamentReservationIn):

    if payload.seats < 1 or payload.seats > 8:
        raise HTTPException(
            400,
            "You can reserve between 1 and 8 tournament seats."
        )

    tournament = next(
        (
            t for t in TOURNAMENTS
            if t["id"] == payload.tournament_id
        ),
        None
    )

    if not tournament:
        raise HTTPException(
            404,
            "Tournament not found."
        )

    data = load_data()

    user = next(
        (
            u for u in data["users"]
            if u["id"] == payload.user_id
        ),
        None
    )

    if not user:
        raise HTTPException(
            404,
            "User not found."
        )

    if "tournament_reservations" not in data:
        data["tournament_reservations"] = []

    reserved_count = sum(
        r["seats"]
        for r in data["tournament_reservations"]
        if r["tournament_id"] == payload.tournament_id
        and r.get("status") == "Reserved"
    )

    remaining = tournament["spots"] - reserved_count

    if payload.seats > remaining:
        raise HTTPException(
            400,
            f"Only {remaining} tournament seat(s) are available."
        )

    reservation_id = next_id(
        data["tournament_reservations"]
    )

    reservation = {
        "id": reservation_id,
        "user_id": payload.user_id,
        "user_name": user["name"],
        "tournament_id": tournament["id"],
        "tournament_title": tournament["title"],
        "game": tournament["game"],
        "date": tournament["date"],
        "seats": payload.seats,
        "status": "Reserved",
        "created_at": datetime.now().isoformat(
            timespec="seconds"
        )
    }

    data["tournament_reservations"].append(
        reservation
    )

    save_data(data)

    return {
        "message": "Tournament seats reserved.",
        "reservation_id": reservation_id,
        "seats": payload.seats,
        "remaining": remaining - payload.seats
    }



@app.post("/api/auth/register")
def register(payload: AuthIn):
    if not payload.name or len(payload.name.strip()) < 2:
        raise HTTPException(400, "Please enter a gamer name")
    if len(payload.password) < 4:
        raise HTTPException(400, "Password must be at least 4 characters")
    data = load_data()
    if any(u["email"].lower() == payload.email.lower() for u in data["users"]):
        raise HTTPException(409, "An account with this email already exists")
    user = {"id":next_id(data["users"]),"name":payload.name.strip(),"email":payload.email.lower(),"password_hash":hash_password(payload.password),"plan":"free","points":0,"weekly_points":0,"week_key":current_week_key()}
    data["users"].append(user)
    save_data(data)
    return {"message":"Account created", "user": {k:v for k,v in user.items() if k != "password_hash"}}


@app.post("/api/auth/login")
def login(payload: AuthIn):
    data = load_data()

    login_value = payload.email.strip().lower()

    user = next(
        (
            u for u in data["users"]
            if u.get("email", "").lower() == login_value
            or u.get("name", "").lower() == login_value
        ),
        None
    )

    if not user or user.get("password_hash") != hash_password(payload.password):
        raise HTTPException(
            401,
            "Invalid username/email or password"
        )

    return {
        "message": "Login successful",
        "user": {
            k: v for k, v in user.items()
            if k != "password_hash"
        }
    }


@app.post("/api/auth/reset-password")
def reset_password(payload: ResetPasswordIn):

    if len(payload.new_password) < 4:
        raise HTTPException(
            400,
            "New password must be at least 4 characters."
        )

    data = load_data()

    user = next(
        (
            u for u in data["users"]
            if u["email"].lower() == payload.email.lower()
        ),
        None
    )

    if not user:
        raise HTTPException(
            404,
            "No account was found with this email."
        )

    user["password_hash"] = hash_password(
        payload.new_password
    )

    save_data(data)

    return {
        "message": "Password reset successfully."
    }


@app.get("/api/leaderboard")
def leaderboard():
    data = load_data()
    players = sorted(
        data.get("users", []),
        key=lambda u: (u.get("weekly_points", 0), u.get("points", 0), u.get("name", "").lower()),
        reverse=True
    )
    rows = []
    for rank, player in enumerate(players, start=1):
        rows.append({
            "rank": rank,
            "id": player["id"],
            "name": player.get("name", "Gamer"),
            "weekly_points": player.get("weekly_points", 0),
            "lifetime_points": player.get("points", 0),
        })
    return {"week": current_week_key(), "leaderboard": rows, "gamer_of_the_week": rows[0] if rows else None}


@app.get("/api/users/{user_id}")
def user(user_id: int):
    data = load_data()
    item = next((u for u in data["users"] if u["id"] == user_id), None)
    if not item:
        raise HTTPException(404, "User not found")
    bookings = sorted([b for b in data["bookings"] if b["user_id"] == user_id], key=lambda b: b["id"], reverse=True)
    safe_user = {k:v for k,v in item.items() if k != "password_hash"}
    return {"user":safe_user, "bookings":bookings}


@app.post("/api/bookings")
def create_booking(payload: BookingIn):
    cafe = next((c for c in CAFES if c["id"] == payload.cafe_id), None)
    if not cafe:
        raise HTTPException(404, "Café not found")
    if payload.seats < 1 or payload.seats > 12:
        raise HTTPException(400, "Seats must be between 1 and 12")
    if payload.booking_type not in {"solo", "duo", "squad"}:
        raise HTTPException(400, "Invalid booking type")
    if payload.booking_type == "duo":
        if payload.seats < 2:
            raise HTTPException(400, "Duo booking needs at least 2 seats")
        if len(payload.duo_players) != 2 or any(not str(x).strip() for x in payload.duo_players):
            raise HTTPException(400, "Both Duo player names are required")
    if payload.booking_type == "squad" and payload.seats < 3:
        raise HTTPException(400, "Squad booking needs at least 3 seats")
    if payload.game not in cafe["games"]:
        raise HTTPException(400, "Selected game is not available at this café")
    if len(payload.seat_numbers) != payload.seats:
        raise HTTPException(400, "Seat selection does not match the number of seats")
    if len(set(payload.seat_numbers)) != len(payload.seat_numbers):
        raise HTTPException(400, "Duplicate seat selected")
    if any(s < 1 or s > cafe["seats"] for s in payload.seat_numbers):
        raise HTTPException(400, "Invalid seat number")

    data = load_data()
    user = next((u for u in data["users"] if u["id"] == payload.user_id), None)
    if not user:
        raise HTTPException(404, "User not found")

    for existing in data["bookings"]:
        if existing.get("status") == "Cancelled":
            continue
        same_slot = (existing["cafe_id"] == payload.cafe_id and existing["booking_date"] == payload.booking_date and existing["booking_time"] == payload.booking_time)
        if same_slot and set(existing.get("seat_numbers", [])) & set(payload.seat_numbers):
            raise HTTPException(409, "One of the selected seats is already booked for this time")

    booking_id = next_id(data["bookings"])
    seat_subtotal = cafe["price"] * payload.seats
    discount = round(seat_subtotal * (0.05 if payload.booking_type == "duo" else 0))
    food_cost = 120 if payload.food else 0
    beverage_cost = 80 if payload.beverage else 0
    amount = max(0, seat_subtotal - discount + food_cost + beverage_cost)

    # Premium users receive the extra 15 minutes. The frontend sends the flag for UI consistency,
    # but the backend also checks the user's saved plan so the stored booking remains authoritative.
    premium_minutes = 15 if user.get("plan") in {"solo", "duo", "squad"} else 0

    booking = {
        "id": booking_id,
        "user_id": payload.user_id,
        "cafe_id": payload.cafe_id,
        "cafe_name": cafe["name"],
        "game": payload.game,
        "booking_date": payload.booking_date,
        "booking_time": payload.booking_time,
        "seats": payload.seats,
        "seat_numbers": payload.seat_numbers,
        "booking_type": payload.booking_type,
        "duo_players": payload.duo_players if payload.booking_type == "duo" else [],
        "food": payload.food,
        "beverage": payload.beverage,
        "discount_percent": 5 if payload.booking_type == "duo" else 0,
        "discount_amount": discount,
        "food_cost": food_cost,
        "beverage_cost": beverage_cost,
        "extra_minutes": premium_minutes,
        "amount": amount,
        "status": "Confirmed",
        "payment": "DEMO_PAYMENT",
        "qr_token": secrets.token_urlsafe(12),
        "created_at": datetime.now().isoformat(timespec="seconds"),
    }
    data["bookings"].append(booking)
    earned_points = payload.seats * 50
    user["points"] += earned_points
    user["weekly_points"] = user.get("weekly_points", 0) + earned_points
    user["week_key"] = current_week_key()
    save_data(data)
    return {"message":"Booking confirmed", "booking_id":booking_id, "qr_token":booking["qr_token"], "amount":amount, "total":amount, "extra_minutes":premium_minutes}


@app.post("/api/bookings/{booking_id}/cancel")
def cancel_booking(booking_id: int, payload: CancelIn):
    data = load_data()
    booking = next((b for b in data["bookings"] if b["id"] == booking_id), None)
    if not booking:
        raise HTTPException(404, "Booking not found")
    if booking["user_id"] != payload.user_id:
        raise HTTPException(403, "You cannot cancel this booking")
    if booking.get("status") == "Cancelled":
        raise HTTPException(400, "This booking is already cancelled")
    booking["status"] = "Cancelled"
    booking["cancellation_charge"] = 100
    booking["cancelled_at"] = datetime.now().isoformat(timespec="seconds")
    save_data(data)
    return {"message":"Booking cancelled", "booking_id":booking_id, "cancellation_charge":100}


@app.post("/api/users/plan")
def update_plan(payload: PlanIn):
    if payload.plan not in {"free","solo","duo","squad"}:
        raise HTTPException(400,"Invalid plan")
    data = load_data()
    user = next((u for u in data["users"] if u["id"] == payload.user_id), None)
    if not user:
        raise HTTPException(404,"User not found")
    user["plan"] = payload.plan
    save_data(data)
    return {"message":"Plan updated","plan":payload.plan}
