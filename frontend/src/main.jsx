import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useParams,
  useLocation, useSearchParams
} from "react-router-dom";
import {
  ArrowRight, CalendarDays, Check, ChevronRight, Crown, Eye, Gamepad2,
  Headphones, Home as HomeIcon, LogIn, LogOut, MapPin, Menu, Monitor, Search,
  ShieldCheck, Sparkles, Star, Trophy, UserPlus, Users, X, Zap,
  CreditCard, Clock3, QrCode, LockKeyhole, Utensils
} from "lucide-react";
import "./styles.css";

const API = "/api";

async function api(path, options = {}) {
  const res = await fetch(API + path, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Something went wrong");
  return data;
}

function getSavedUser() {
  try { return JSON.parse(localStorage.getItem("playirl_user") || "null"); }
  catch { return null; }
}

function App() {
  const [contrast, setContrast] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(getSavedUser);

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", contrast);
  }, [contrast]);

  function loginUser(nextUser) {
  localStorage.setItem("playirl_user", JSON.stringify(nextUser));
  setUser(nextUser);
}

function logout() {
  const userName = user?.name || "User";

  const confirmed = window.confirm(
    `Are you sure you want to log out, ${userName}?`
  );

  if (!confirmed) return;

  alert(`${userName} has been logged out successfully.`);

  localStorage.removeItem("playirl_user");
  setUser(null);
}

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <Header
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        contrast={contrast}
        setContrast={setContrast}
        user={user}
        logout={logout}
      />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cafes" element={<Cafes />} />
          <Route path="/cafes/:id" element={<CafeDetails />} />
          <Route path="/book/:id" element={<Booking user={user} />} />
          <Route path="/login" element={<Auth mode="login" onAuth={loginUser} />} />
          <Route path="/signup" element={<Auth mode="signup" onAuth={loginUser} />} />
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/premium" element={<Premium user={user} />} />
          <Route path="/tournaments" element={<Tournaments user={user} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
        </Routes>
      </main>
      <FloatingBook />
      <Footer />
    </div>
  );
}


function Header({ menuOpen, setMenuOpen, contrast, setContrast, user, logout }) {
  return (
    <header className="topbar">
      <Link className="brand" to="/" aria-label="PlayIRL home">
        <span className="brand-mark"><Gamepad2 size={22} /></span>
        <span>Play<span>IRL</span></span>
      </Link>

      <nav className={`main-nav ${menuOpen ? "open" : ""}`} aria-label="Primary navigation">
        <NavLink to="/" end><HomeIcon size={15} /> Home</NavLink>
        <NavLink to="/cafes">Cafés</NavLink>
        <NavLink to="/tournaments">Tournaments</NavLink>
        <NavLink to="/leaderboard">Leaderboard</NavLink>
        <NavLink to="/premium">Premium</NavLink>
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
      </nav>

      <div className="header-actions">
        <button className="icon-btn" onClick={() => setContrast(!contrast)} aria-label="Toggle high contrast">
          <Eye size={19} />
        </button>
        {user ? (
          <div className="account-menu">
            <Link className="profile-chip" to="/dashboard">
              <span className="avatar">{user.name?.charAt(0)?.toUpperCase() || "P"}</span>
              <span className="desktop-only">{user.name}</span>
            </Link>
            <button className="logout-btn" onClick={logout} title="Log out" aria-label="Log out"><LogOut size={17} /></button>
          </div>
        ) : (
          <div className="auth-links desktop-only">
            <Link to="/login" className="auth-link">Log in</Link>
            <Link to="/signup" className="auth-link auth-link-main"><UserPlus size={15} /> Sign up</Link>
          </div>
        )}
        <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}

function Home() {
  const [cafes, setCafes] = useState([]);
  const [cities, setCities] = useState([]);
  useEffect(() => {
    api("/cafes").then(setCafes);
    api("/cities").then(setCities);
  }, []);

  return (
    <>
      <section className="hero noxen-hero">
        <div className="hero-noise" />
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> PLAYIRL / GAMING NETWORK</div>
          <h1>PLAY.<br /><span>LEARN.</span><br />EARN.</h1>
          <p className="hero-text">Find gaming cafés, compare the exact setup, choose your seat and lock it before someone else does.</p>
          <div className="hero-actions">
            <Link className="btn btn-primary btn-lg" to="/cafes">Find a gaming café <ArrowRight size={18} /></Link>
            <Link className="btn btn-ghost btn-lg" to="/tournaments">Enter the scene</Link>
          </div>
          <div className="hero-proof">
            <span><ShieldCheck size={16} /> Screen-reader friendly</span>
            <span><MapPin size={16} /> {cities.length || 5}+ cities</span>
            <span><Zap size={16} /> Choose · Hold · Confirm</span>
          </div>
        </div>

        <div className="hero-image-wrap">
          <img src="/playirl-hero.jpg" alt="Gamers playing together at a neon-lit gaming café" className="hero-real-image" />
          <div className="hero-image-overlay" />
          <div className="hero-image-label top-label"><span className="live-dot" /> LIVE GAMING FLOOR</div>
          <div className="hero-image-label bottom-label"><strong>GOOD GAMES.</strong><span>BETTER PEOPLE.</span></div>
        </div>
      </section>

      <section className="city-strip section">
        <div>
          <span className="section-kicker">EXPAND YOUR PLAYGROUND</span>
          <h2>Search cafés beyond Mumbai.</h2>
        </div>
        <div className="city-pills">
          {cities.map(city => <Link key={city} to={`/cafes?city=${encodeURIComponent(city)}`}>{city}</Link>)}
        </div>
      </section>

      <section className="section section-tight">
        <div className="section-head"><div><span className="section-kicker">THE PLAYIRL FLOW</span><h2>From search to seat in three moves.</h2></div></div>
        <div className="flow-grid">
          <FlowCard number="01" title="CHOOSE" icon={<Search />} text="Compare cafés, PC specs, games, images and exact seats." />
          <FlowCard number="02" title="HOLD" icon={<Clock3 />} text="Your selected seats are temporarily protected while you complete payment." />
          <FlowCard number="03" title="CONFIRM" icon={<QrCode />} text="Demo payment confirms the booking and creates a unique QR pass." />
        </div>
      </section>

      <section className="section">
        <div className="section-head"><div><span className="section-kicker">FEATURED CAFÉS</span><h2>Setups worth leaving home for.</h2></div><Link className="text-link" to="/cafes">See all <ArrowRight size={16} /></Link></div>
        <div className="cafe-grid">{cafes.slice(0, 3).map(cafe => <CafeCard key={cafe.id} cafe={cafe} />)}</div>
      </section>

      <section className="section premium-strip">
        <div className="premium-copy"><div className="eyebrow"><Crown size={15} /> PLAYIRL PREMIUM</div><h2>Get the seat before the crowd.</h2><p>Early access to released seats, esports opportunities and private seating for live-stream events.</p><Link className="btn btn-primary" to="/premium">Explore Premium <ArrowRight size={17} /></Link></div>
        <div className="premium-stack"><div className="stack-card back" /><div className="stack-card mid" /><div className="stack-card front"><Crown size={30} /><strong>PREMIUM</strong><span>SOLO + SQUAD</span></div></div>
      </section>
    </>
  );
}

function FlowCard({ number, title, icon, text }) {
  return <article className="flow-card"><span>{number}</span><div className="flow-icon">{icon}</div><h3>{title}</h3><p>{text}</p></article>;
}

function CafeCard({ cafe }) {
  return (
    <article className="cafe-card">
      <div className="cafe-image"><img src={cafe.image} alt={`${cafe.name} gaming setup`} /><div className="image-overlay" /><span className="rating"><Star size={14} fill="currentColor" /> {cafe.rating}</span><span className="cafe-tag">{cafe.tag}</span></div>
      <div className="cafe-body">
        <div className="cafe-title-row"><div><h3>{cafe.name}</h3><p><MapPin size={14} /> {cafe.area}, {cafe.city}</p></div><strong>₹{cafe.price}<small>/hr</small></strong></div>
        <div className="spec-row"><span><b>GPU</b>{cafe.gpu}</span><span><b>CPU</b>{cafe.cpu}</span><span><b>RAM</b>{cafe.ram}</span></div>
        <div className="game-list">{cafe.games.slice(0, 3).map(g => <span key={g}>{g}</span>)}</div>
        <Link className="card-link" to={`/cafes/${cafe.id}`}>View café <ChevronRight size={16} /></Link>
      </div>
    </article>
  );
}

function Cafes() {
  const [cafes, setCafes] = useState([]);
  const [cities, setCities] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [city, setCity] = useState(searchParams.get("city") || "All");
  const [sort, setSort] = useState("rating");

  useEffect(() => { api("/cafes").then(setCafes); api("/cities").then(setCities); }, []);
  useEffect(() => { setSearchParams(city === "All" ? {} : { city }, { replace: true }); }, [city, setSearchParams]);

  const filtered = useMemo(() => cafes
    .filter(c => city === "All" || c.city === city)
    .filter(c => [c.name, c.area, c.city, ...c.games].join(" ").toLowerCase().includes(search.toLowerCase()))
    .sort((a,b) => sort === "price" ? a.price - b.price : b.rating - a.rating), [cafes, city, search, sort]);

  return <section className="page">
    <div className="page-hero"><span className="section-kicker">DISCOVER / {city === "All" ? "ALL CITIES" : city.toUpperCase()}</span><h1>Gaming cafés,<br /><span>your way.</span></h1><p>See the actual setup. See the actual seats. Then book.</p></div>
    <div className="filter-bar"><label className="search-box"><Search size={18} /><span className="sr-only">Search</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search café, area or game..." /></label><label><span className="sr-only">City</span><select value={city} onChange={e => setCity(e.target.value)}><option>All</option>{cities.map(c => <option key={c}>{c}</option>)}</select></label><label><span className="sr-only">Sort</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="rating">Top rated</option><option value="price">Lowest price</option></select></label></div>
    <div className="results-meta"><b>{filtered.length}</b> cafés found <span>• {city === "All" ? "Mumbai + Bengaluru + Pune + more" : city}</span></div>
    <div className="cafe-grid cafe-grid-wide">{filtered.map(cafe => <CafeCard key={cafe.id} cafe={cafe} />)}</div>
  </section>;
}

function CafeDetails() {
  const { id } = useParams(); const [cafe, setCafe] = useState(null);
  useEffect(() => { api(`/cafes/${id}`).then(setCafe); }, [id]);
  if (!cafe) return <Loading />;
  return <section className="page">
    <div className="detail-hero"><div className="detail-photo"><img src={cafe.image} alt={`${cafe.name} gaming floor`} /></div><div><span className="section-kicker">CAFÉ PROFILE</span><h1>{cafe.name}</h1><p className="location-line"><MapPin size={17} /> {cafe.area}, {cafe.city}</p><p>{cafe.description}</p><div className="detail-rating"><Star size={17} fill="currentColor" /> {cafe.rating} rating <span>•</span> {cafe.seats} total seats</div></div></div>
    <div className="detail-layout"><div><div className="panel"><div className="panel-head"><h2>PC specifications</h2><span className="verified"><Check size={14} /> Listed</span></div><div className="spec-big-grid"><Spec label="GPU" value={cafe.gpu}/><Spec label="CPU" value={cafe.cpu}/><Spec label="RAM" value={cafe.ram}/><Spec label="Seats" value={cafe.seats}/></div></div><div className="panel"><div className="panel-head"><h2>Games available</h2></div><div className="game-list large">{cafe.games.map(g => <span key={g}>{g}</span>)}</div></div></div><aside className="booking-card"><span className="section-kicker">FROM</span><div className="price-big">₹{cafe.price}<small>/hour</small></div><p>Choose the exact seat and continue through the demo payment flow.</p><Link className="btn btn-primary full" to={`/book/${cafe.id}`}>Choose seats <ArrowRight size={17}/></Link><ul className="check-list"><li><Check size={16}/> Exact seat map</li><li><Check size={16}/> Temporary seat hold</li><li><Check size={16}/> Demo payment + QR</li></ul></aside></div>
  </section>;
}

function Spec({ label, value }) { return <div className="spec-big"><span>{label}</span><strong>{value}</strong></div>; }

function Booking({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cafe, setCafe] = useState(null);
  const [userData, setUserData] = useState(user);
  const [step, setStep] = useState(1);
  const [selected, setSelected] = useState([]);
  const [held, setHeld] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");
  const [bookingType, setBookingType] = useState("solo");
  const [duoPlayers, setDuoPlayers] = useState({ player1: "", player2: "" });
  const [food, setFood] = useState(false);
  const [beverage, setBeverage] = useState(false);
  const [form, setForm] = useState({ game: "", booking_date: new Date().toISOString().slice(0,10), booking_time: "18:00" });

  useEffect(() => {
    api(`/cafes/${id}`).then(c => {
      setCafe(c);
      setForm(f => ({ ...f, game: c.games[0] || "" }));
    }).catch(e => setError(e.message));
  }, [id]);

  useEffect(() => {
    if (!user) {
      navigate(`/login?redirect=/book/${id}`, { replace: true });
      return;
    }
    api(`/users/${user.id}`).then(result => setUserData(result.user)).catch(() => setUserData(user));
  }, [user, id, navigate]);

  const seats = useMemo(() => Array.from({length: Math.min(cafe?.seats || 28, 28)}, (_, i) => ({
    id: i + 1,
    status: [3,7,12,18,23].includes(i + 1) ? "booked" : "free"
  })), [cafe]);

  const isPremium = userData?.plan && userData.plan !== "free";
  const duoDiscount = bookingType === "duo" ? 0.05 : 0;
  const seatSubtotal = selected.length * (cafe?.price || 0);
  const foodCost = food ? 120 : 0;
  const beverageCost = beverage ? 80 : 0;
  const discountAmount = Math.round(seatSubtotal * duoDiscount);
  const total = Math.max(0, seatSubtotal - discountAmount + foodCost + beverageCost);

  function toggleSeat(seat) {
    if (seat.status === "booked" || held) return;
    setSelected(prev => prev.includes(seat.id) ? prev.filter(x => x !== seat.id) : [...prev, seat.id]);
  }

  function holdSeats() {
    if (!selected.length) return setError("Choose at least one seat first.");
    if (bookingType === "duo" && (!duoPlayers.player1.trim() || !duoPlayers.player2.trim())) return setError("Enter both Duo player names before holding the seats.");
    if (bookingType === "duo" && selected.length < 2) return setError("Duo booking needs at least 2 seats — one for each player.");
    if (bookingType === "squad" && selected.length < 3) return setError("Squad booking needs at least 3 seats.");
    setHeld(true);
    setStep(2);
    setError("");
  }

  function openPayment() {
    if (!selected.length) return setError("Choose at least one seat first.");
    if (!held) return setError("Hold the selected seats before payment.");
    setPaymentOpen(true);
    setStep(3);
  }

  async function payDemo() {
    setPaymentOpen(false);
    setError("");
    try {
      const result = await api("/bookings", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          cafe_id: Number(id),
          game: form.game,
          booking_date: form.booking_date,
          booking_time: form.booking_time,
          seats: selected.length,
          seat_numbers: selected,
          booking_type: bookingType,
          duo_players: bookingType === "duo" ? [duoPlayers.player1, duoPlayers.player2] : [],
          food,
          beverage,
          discount_percent: bookingType === "duo" ? 5 : 0,
          extra_minutes: isPremium ? 15 : 0
        })
      });
      setSuccess({ ...result, seats: selected, cafe, total, bookingType, food, beverage, discountAmount, extraMinutes: isPremium ? 15 : 0 });
    } catch(e) {
      setError(e.message);
    }
  }

  if (!user || !cafe) return <Loading />;

  return <section className="page booking-page">
    <div className="booking-head"><span className="section-kicker">BOOKING / {cafe.name.toUpperCase()}</span><h1>Choose. <span>Hold.</span> Confirm.</h1><p>Select your session type, players, games and exact computers, then complete the demo payment.</p></div>
    <div className="booking-cafe-banner"><img src={cafe.image} alt={`${cafe.name} setup`} /><div><strong>{cafe.name}</strong><span>{cafe.area}, {cafe.city} · {cafe.gpu} · {cafe.ram}</span></div><b>₹{cafe.price}/hr</b></div>
    <div className="booking-steps"><Step n="01" title="CHOOSE" active={step===1 || step>1}/><Step n="02" title="HOLD" active={step>=2}/><Step n="03" title="CONFIRM" active={step>=3}/></div>
    <div className="booking-layout">
      <div className="panel seat-panel">
        <div className="panel-head"><div><span className="section-kicker">EXACT COMPUTER</span><h2>Choose your seats</h2></div><div className="seat-legend"><span><i className="seat-dot free"/> Free</span><span><i className="seat-dot selected"/> Selected</span><span><i className="seat-dot booked"/> Booked</span></div></div>
        <div className="booking-options">
          <div className="booking-option-title"><div><strong>How are you playing?</strong><span>Choose Solo, Duo or Squad.</span></div>{isPremium && <em><Crown size={13}/> Premium +15 min</em>}</div>
          <div className="booking-type-grid">
            {[["solo","Solo","1+ player",<Gamepad2 size={18}/>],["duo","Duo","2 players · 5% off",<Users size={18}/>],["squad","Squad","3+ players",<Users size={18}/>]].map(([value,title,subtitle,icon])=><button type="button" key={value} className={`booking-type ${bookingType===value?"active":""}`} onClick={()=>setBookingType(value)} disabled={held}>{icon}<strong>{title}</strong><span>{subtitle}</span></button>)}
          </div>
          {bookingType === "duo" && <div className="duo-player-grid"><label>Player 1<input value={duoPlayers.player1} onChange={e=>setDuoPlayers({...duoPlayers,player1:e.target.value})} placeholder="Duo player 1" disabled={held}/></label><label>Player 2<input value={duoPlayers.player2} onChange={e=>setDuoPlayers({...duoPlayers,player2:e.target.value})} placeholder="Duo player 2" disabled={held}/></label></div>}
          {bookingType === "squad" && <div className="booking-info-strip"><Users size={16}/><span>Squad bookings require at least 3 selected seats. Add as many seats as your squad needs.</span></div>}
        </div>
        <div className="screen-wall">MONITOR WALL / FRONT</div>
        <div className="seat-grid">{seats.map(seat=><button key={seat.id} className={`seat ${seat.status} ${selected.includes(seat.id)?"selected":""}`} disabled={seat.status==="booked"||held} onClick={()=>toggleSeat(seat)} aria-label={`PC ${seat.id} ${seat.status}`}>PC {seat.id}</button>)}</div>
        <div className="seat-floor"><span>PLAYER FLOOR</span><span>ENTRY / STAFF</span></div>
      </div>
      <aside className="panel booking-summary-panel">
        <span className="section-kicker">SESSION</span>
        <div className="summary-line"><span>Game</span><select value={form.game} onChange={e=>setForm({...form,game:e.target.value})} disabled={held}>{cafe.games.map(g=><option key={g}>{g}</option>)}</select></div>
        <div className="summary-line"><span>Date</span><input type="date" value={form.booking_date} onChange={e=>setForm({...form,booking_date:e.target.value})} disabled={held}/></div>
        <div className="summary-line"><span>Time</span><select value={form.booking_time} onChange={e=>setForm({...form,booking_time:e.target.value})} disabled={held}>{["12:00","14:00","16:00","18:00","20:00","22:00"].map(t=><option key={t}>{t}</option>)}</select></div>
        <div className="booking-addons"><strong>Food & beverage</strong><label><input type="checkbox" checked={food} onChange={e=>setFood(e.target.checked)} disabled={held}/><span>Snack box</span><b>₹120</b></label><label><input type="checkbox" checked={beverage} onChange={e=>setBeverage(e.target.checked)} disabled={held}/><span>Gaming beverage</span><b>₹80</b></label></div>
        <div className="selected-seat-list"><strong>{selected.length} seat(s) selected</strong>{selected.length?selected.map(s=><span key={s}>PC {s}</span>):<small>Select exact computers from the map.</small>}</div>
        <div className="price-breakdown"><div><span>{selected.length} × ₹{cafe.price}</span><b>₹{seatSubtotal}</b></div>{bookingType==="duo"&&<div className="discount-line"><span>Duo discount · 5%</span><b>-₹{discountAmount}</b></div>}{food&&<div><span>Snack box</span><b>₹120</b></div>}{beverage&&<div><span>Beverage</span><b>₹80</b></div>}{isPremium&&<div className="premium-time-line"><span><Crown size={13}/> Premium extra time</span><b>+15 min</b></div>}</div>
        <div className="total-row"><span>Total</span><strong>₹{total}</strong></div>
        {!held?<button className="btn btn-primary full" onClick={holdSeats}>Hold selected seats <Clock3 size={17}/></button>:<button className="btn btn-primary full" onClick={openPayment}>Continue to demo payment <CreditCard size={17}/></button>}
        {held&&<div className="hold-banner"><Clock3 size={17}/><div><strong>Seats held</strong><span>Protected for this demo while you complete payment.</span></div></div>}
        {error&&<p className="form-status error" role="alert">{error}</p>}
      </aside>
    </div>
    {paymentOpen&&<div className="modal-backdrop"><div className="payment-modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={()=>setPaymentOpen(false)} aria-label="Close"><X/></button><div className="payment-icon"><CreditCard/></div><span className="section-kicker">DEMO PAYMENT GATEWAY</span><h2>Confirm your session</h2><p>This is a college-project demo. No real money is charged.</p><div className="payment-card"><div><span>PLAYIRL DEMO</span><strong>•••• 4242</strong></div><LockKeyhole size={20}/></div><div className="total-row"><span>Amount</span><strong>₹{total}</strong></div><button className="btn btn-primary full" onClick={payDemo}>Pay ₹{total} & confirm <ArrowRight size={17}/></button></div></div>}
    {success&&<BookingSuccess result={success} onClose={()=>navigate("/dashboard")}/>} 
  </section>;
}

function Step({n,title,active}){return <div className={`booking-step ${active?"active":""}`}><span>{n}</span><strong>{title}</strong></div>;}

function BookingSuccess({result,onClose}){
  const qrData=encodeURIComponent(`PLAYIRL|BOOKING:${result.booking_id}|CAFE:${result.cafe.name}|SEATS:${result.seats.join(",")}`);
  return <div className="modal-backdrop"><div className="success-modal" role="dialog" aria-modal="true"><div className="success-glow"/><div className="success-icon"><Check size={32}/></div><span className="section-kicker">BOOKING CONFIRMED</span><h2>Your slots are booked.</h2><p>Show this QR code at the café. It is unique to this booking.</p><img className="booking-qr" src={`https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${qrData}`} alt={`QR code for booking ${result.booking_id}`}/><div className="booking-code"><span>BOOKING ID</span><strong>PI-{String(result.booking_id).padStart(5,"0")}</strong></div><div className="confirmed-details"><span>{result.cafe.name}</span><span>{result.bookingType.toUpperCase()} · PC {result.seats.join(", PC ")}</span><span>₹{result.total}</span></div><button className="btn btn-primary full" onClick={onClose}>Go to dashboard <ArrowRight size={17}/></button></div></div>;
}

function Auth({ mode, onAuth }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [resetForm, setResetForm] = useState({
    email: "",
    new_password: ""
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const isLogin = mode === "login";
  const redirect = searchParams.get("redirect") || "/dashboard";

  async function submit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api(
        isLogin ? "/auth/login" : "/auth/register",
        {
          method: "POST",
          body: JSON.stringify(form)
        }
      );

      onAuth(result.user);
      navigate(redirect);

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const result = await api(
        "/auth/reset-password",
        {
          method: "POST",
          body: JSON.stringify(resetForm)
        }
      );

      setMessage(result.message);

      setResetOpen(false);

      setResetForm({
        email: "",
        new_password: ""
      });

    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">

      <div className="auth-visual">

        <div className="auth-visual-copy">

          <span className="section-kicker">
            PLAYIRL / PLAYER ACCESS
          </span>

          <h1>
            YOUR GAME.
            <br />
            <span>YOUR SEAT.</span>
            <br />
            YOUR SCENE.
          </h1>

          <p>
            Sign in to save bookings, earn Play Points
            and keep your gaming sessions together.
          </p>

          <div className="auth-stat-grid">

            <div>
              <strong>01</strong>
              <span>Exact seat booking</span>
            </div>

            <div>
              <strong>02</strong>
              <span>QR entry pass</span>
            </div>

            <div>
              <strong>03</strong>
              <span>Play Points</span>
            </div>

          </div>

        </div>

      </div>

      <div className="auth-panel">

        <div className="auth-toggle">

          <Link
            className={isLogin ? "active" : ""}
            to={`/login${
              redirect !== "/dashboard"
                ? `?redirect=${encodeURIComponent(redirect)}`
                : ""
            }`}
          >
            <LogIn size={16} />
            Log in
          </Link>

          <Link
            className={!isLogin ? "active" : ""}
            to={`/signup${
              redirect !== "/dashboard"
                ? `?redirect=${encodeURIComponent(redirect)}`
                : ""
            }`}
          >
            <UserPlus size={16} />
            Create account
          </Link>

        </div>

        <div className="auth-form-wrap">

          <span className="auth-icon">
            {isLogin ? <LogIn /> : <UserPlus />}
          </span>

          <span className="section-kicker">
            {isLogin ? "WELCOME BACK" : "NEW PLAYER"}
          </span>

          <h2>
            {isLogin
              ? "Log in to PlayIRL"
              : "Create your PlayIRL account"}
          </h2>

          <p>
            {isLogin
              ? "Continue your gaming journey."
              : "Build your profile before your first booking."}
          </p>

          <form onSubmit={submit}>

            {!isLogin && (
              <label>
                Gamer name

                <input
                  value={form.name}
                  onChange={e =>
                    setForm({
                      ...form,
                      name: e.target.value
                    })
                  }
                  placeholder="Your gamer name"
                  required
                />
              </label>
            )}

            <label>
  {isLogin ? "Username or Email" : "Email"}
  <input
    type="email"
    value={form.email}
    onChange={e =>
      setForm({
        ...form,
        email: e.target.value
      })
    }
    placeholder={isLogin ? "Username or email" : "Enter your email"}
    required
  />
</label>
            <label>
              Password

              <input
                type="password"
                value={form.password}
                onChange={e =>
                  setForm({
                    ...form,
                    password: e.target.value
                  })
                }
                placeholder="••••••••"
                minLength="4"
                required
              />
            </label>

            {isLogin && (
              <button
                type="button"
                className="forgot-password-btn"
                style={{
                  color: "inherit",
                  textDecoration: "underline",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setResetOpen(true);
                  setError("");
                  setMessage("");
                }}
              >
                Forgot Password?
              </button>
            )}

            <button
              className="btn btn-primary full auth-submit"
              disabled={loading}
            >
              {loading
                ? "Connecting..."
                : isLogin
                  ? "Log in"
                  : "Create account"}

              <ArrowRight size={17} />
            </button>

          </form>

          {error && (
            <p className="form-status error">
              {error}
            </p>
          )}

          {message && (
            <p className="form-status">
              {message}
            </p>
          )}

          <div className="auth-switch">

            {isLogin ? (
              <>
                Don’t have an account?{" "}
                <Link
                  to={`/signup?redirect=${encodeURIComponent(
                    redirect
                  )}`}
                >
                  Create one
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  to={`/login?redirect=${encodeURIComponent(
                    redirect
                  )}`}
                >
                  Log in
                </Link>
              </>
            )}

          </div>

        </div>

      </div>

      {/* Reset password popup */}

      {resetOpen && (

        <div className="modal-backdrop">

          <div
            className="reset-password-modal"
            role="dialog"
            aria-modal="true"
          >

            <button
              className="modal-close"
              onClick={() => setResetOpen(false)}
              aria-label="Close"
            >
              <X />
            </button>

            <div className="tournament-modal-icon">
              <LockKeyhole size={27} />
            </div>

            <span className="section-kicker">
              ACCOUNT SECURITY
            </span>

            <h2>Reset your password</h2>

            <p>
              Enter your registered email and choose a new password.
            </p>

            <form onSubmit={resetPassword}>

              <label>
                Registered email

                <input
                  type="email"
                  value={resetForm.email}
                  onChange={e =>
                    setResetForm({
                      ...resetForm,
                      email: e.target.value
                    })
                  }
                  placeholder="you@example.com"
                  required
                />
              </label>

              <label>
                New password

                <input
                  type="password"
                  value={resetForm.new_password}
                  onChange={e =>
                    setResetForm({
                      ...resetForm,
                      new_password: e.target.value
                    })
                  }
                  placeholder="New password"
                  minLength="4"
                  required
                />
              </label>

              <button
                className="btn btn-primary full"
                disabled={loading}
              >
                {loading
                  ? "Updating..."
                  : "Reset password"}

                <Check size={17} />
              </button>

            </form>

          </div>

        </div>

      )}

    </section>
  );
}
function Dashboard({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [canceling, setCanceling] = useState(null);
  const [cancelMessage, setCancelMessage] = useState("");
  async function loadDashboard() {
    if (user) { try { setData(await api(`/users/${user.id}`)); } catch(e) { setCancelMessage(e.message); } }
    else navigate("/login?redirect=/dashboard");
  }
  useEffect(() => { loadDashboard(); }, [user, navigate]);
  async function cancelBooking(booking) {
    if (!window.confirm("Cancel this booking? A cancellation charge of ₹100 will apply.")) return;
    setCanceling(booking.id); setCancelMessage("");
    try { await api(`/bookings/${booking.id}/cancel`, {method:"POST",body:JSON.stringify({user_id:user.id})}); setCancelMessage("Booking cancelled. ₹100 cancellation charge applied."); await loadDashboard(); }
    catch(e) { setCancelMessage(e.message); } finally { setCanceling(null); }
  }
  if (!user || !data) return <Loading />;
  const { bookings } = data;
  const exploredCafes = [...new Map(bookings.filter(b => b.status !== "Cancelled").map(b => [b.cafe_id, b.cafe_name])).values()];
  const explorerTarget = 5;
  const explorerProgress = Math.min(exploredCafes.length, explorerTarget);
  return <section className="page">
    <div className="dashboard-head"><div><span className="section-kicker">YOUR SPACE</span><h1>Welcome back, <span>{user.name}.</span></h1><p>Your bookings, membership and gaming activity in one place.</p></div><div className="points-card"><Sparkles size={18}/><span>PLAY POINTS</span><strong>{data.user.points.toLocaleString()}</strong></div></div>
    {cancelMessage&&<p className="form-status" role="status">{cancelMessage}</p>}
    <div className="dash-grid"><div className="dash-main">
      <div className="panel"><div className="panel-head"><h2>Upcoming bookings</h2><Link className="text-link" to="/cafes">Book another <ArrowRight size={15}/></Link></div>{bookings.length===0?<EmptyBookings/>:bookings.map(b=><div className="booking-row" key={b.id}><div className="booking-date"><b>{new Date(b.booking_date).toLocaleDateString("en-IN",{day:"2-digit"})}</b><span>{new Date(b.booking_date).toLocaleDateString("en-IN",{month:"short"})}</span></div><div className="booking-info"><strong>{b.cafe_name}</strong><span>{b.booking_type?`${b.booking_type.toUpperCase()} · `:""}{b.game} · {b.booking_time} · PC {b.seat_numbers?.join(", PC ")||`${b.seats} seat(s)`}{b.extra_minutes?` · +${b.extra_minutes} min`:""}</span></div><div className="booking-row-actions"><span className={`status-pill ${String(b.status).toLowerCase()==="cancelled"?"cancelled":""}`}>{b.status}</span>{b.status==="Confirmed"&&<button className="cancel-booking-btn" onClick={()=>cancelBooking(b)} disabled={canceling===b.id}>{canceling===b.id?"Cancelling...":"Cancel · ₹100"}</button>}</div></div>)}</div>
      <div className="panel cafe-explorer-card"><div className="panel-head"><div><span className="section-kicker">EXPLORE THE MAP</span><h2>☕ Café Explorer</h2></div><strong>{exploredCafes.length}/{explorerTarget}</strong></div><p>Book at different cafés to build your PlayIRL café journey.</p><div className="explorer-progress"><span style={{width:`${(explorerProgress/explorerTarget)*100}%`}} /></div><div className="explorer-list">{exploredCafes.length?exploredCafes.map(name=><span key={name}><Check size={13}/>{name}</span>):<span className="explorer-empty">No cafés explored yet — book your first one.</span>}</div><Link className="text-link" to="/cafes">Explore cafés <ArrowRight size={15}/></Link></div>
      <div className="panel"><div className="panel-head"><h2>Your membership</h2><Link className="text-link" to="/premium">Manage <ArrowRight size={15}/></Link></div><div className="membership-card"><div className="membership-icon"><Crown/></div><div><span>Current plan</span><strong>{data.user.plan==="free"?"Free Player":`Premium ${data.user.plan}`}</strong><p>{data.user.plan==="free"?"Upgrade for early access and premium events.":"Premium includes food & beverage options, +15 minutes and early access."}</p></div></div></div>
    </div><aside className="dash-side"><div className="panel side-stat"><span>SESSIONS</span><strong>{bookings.filter(b=>b.status!=="Cancelled").length}</strong><p>Active bookings through PlayIRL</p></div><div className="panel side-stat"><span>TOURNAMENTS</span><strong>03</strong><p>Open opportunities</p><Link className="text-link" to="/tournaments">Explore <ArrowRight size={15}/></Link></div><div className="panel side-stat leaderboard-mini"><span>WEEKLY RANKING</span><strong>🏆</strong><p>See who is leading PlayIRL this week.</p><Link className="text-link" to="/leaderboard">View leaderboard <ArrowRight size={15}/></Link></div></aside></div>
  </section>;
}

function EmptyBookings(){return <div className="empty-state"><CalendarDays size={28}/><strong>No bookings yet.</strong><p>Find a café and lock in your first session.</p><Link className="btn btn-primary" to="/cafes">Explore cafés</Link></div>;}

function Premium({user}){const [current,setCurrent]=useState(user?.plan||"free");const [message,setMessage]=useState("");const navigate=useNavigate();async function choose(plan){if(!user)return navigate("/login?redirect=/premium");try{await api("/users/plan",{method:"POST",body:JSON.stringify({user_id:user.id,plan})});setCurrent(plan);localStorage.setItem("playirl_user",JSON.stringify({...user,plan}));setMessage(`Premium ${plan.charAt(0).toUpperCase()+plan.slice(1)} is selected for this demo.`);}catch(e){setMessage(e.message);}}const plans=[{id:"solo",name:"Solo",price:"₹299",subtitle:"For one player",icon:<Gamepad2/>,perks:["Early access to abandoned seats","Tournament & esports opportunities","Food & beverage add-ons","Extra 15 minutes per session","Private live-stream seating"]},{id:"duo",name:"Duo",price:"₹499",subtitle:"For two players",icon:<Users/>,perks:["Everything in Solo","5% Duo booking discount","Food & beverage add-ons","Extra 15 minutes per session","Duo tournament opportunities"]},{id:"squad",name:"Squad",price:"₹799",subtitle:"For your gaming crew",icon:<Users/>,perks:["Everything in Duo","Squad-first seat drops","Food & beverage add-ons","Extra 15 minutes per session","Squad tournament access"]}];return <section className="page"><div className="premium-page-head"><span className="eyebrow"><Crown size={15}/> PLAYIRL PREMIUM</span><h1>Choose your <span>play style.</span></h1><p>Solo, Duo or Squad — Premium adds more time, food & beverage options and special access.</p></div><div className="premium-benefits"><Benefit icon={<Zap/>} title="Early seat access" text="When seats become available through cancellations, Premium members get an earlier booking window."/><Benefit icon={<Trophy/>} title="Esports opportunities" text="Get access to tournament listings and Premium-only event opportunities."/><Benefit icon={<Utensils/>} title="Food + extra time" text="Premium sessions can add food and beverages and include an extra 15 minutes."/></div><div className="plan-grid premium-three-plans">{plans.map(plan=><div className={`plan-card ${current===plan.id?"selected":""}`} key={plan.id}><div className="plan-top"><div className="plan-icon">{plan.icon}</div>{current===plan.id&&<span className="selected-label"><Check size={13}/> Active</span>}</div><h2>{plan.name}</h2><p>{plan.subtitle}</p><div className="plan-price">{plan.price}<small>/month</small></div><ul>{plan.perks.map(p=><li key={p}><Check size={16}/>{p}</li>)}</ul><button className={`btn ${current===plan.id?"btn-secondary":"btn-primary"} full`} onClick={()=>choose(plan.id)}>{current===plan.id?"Selected":`Choose ${plan.name}`}</button></div>)}</div><p className="form-status center">{message}</p></section>;}

function Benefit({icon,title,text}){return <article className="benefit"><div className="feature-icon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div></article>;}
function Leaderboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => { api("/leaderboard").then(setData).catch(e => setError(e.message)); }, []);
  if (error) return <section className="page"><div className="panel empty-state"><Trophy size={30}/><h2>Leaderboard unavailable</h2><p>{error}</p></div></section>;
  if (!data) return <Loading />;
  const leader = data.gamer_of_the_week;
  return <section className="page leaderboard-page">
    <div className="page-hero leaderboard-hero">
      <span className="section-kicker"><Trophy size={14}/> WEEKLY / PLAY POINTS</span>
      <h1>Who is leading<br/><span>this week?</span></h1>
      <p>Every PlayIRL user competes on the same weekly board. Booking sessions earns Play Points and moves you up the board.</p>
    </div>
    {leader && leader.weekly_points > 0 && <div className="gamer-week-card panel">
      <div className="gamer-week-icon"><Trophy size={30}/></div>
      <div><span className="section-kicker">🎮 GAMER OF THE WEEK</span><h2>{leader.name}</h2><p>{leader.weekly_points.toLocaleString()} Play Points this week</p></div>
      <div className="gamer-week-points"><strong>{leader.weekly_points.toLocaleString()}</strong><span>PTS</span></div>
    </div>}
    <div className="leaderboard-panel panel">
      <div className="panel-head"><div><span className="section-kicker">CURRENT WEEK</span><h2>PlayIRL Leaderboard</h2></div><span className="leaderboard-reset">Resets every Monday</span></div>
      <div className="leaderboard-list">{data.leaderboard.map(player => <div className={`leaderboard-row ${player.rank <= 3 ? `rank-${player.rank}` : ""}`} key={player.id}>
        <div className="leader-rank">{player.rank <= 3 ? ["🥇","🥈","🥉"][player.rank-1] : `#${player.rank}`}</div>
        <div className="leader-avatar">{player.name?.charAt(0)?.toUpperCase() || "P"}</div>
        <div className="leader-name"><strong>{player.name}</strong><span>PlayIRL Gamer</span></div>
        <div className="leader-points"><strong>{player.weekly_points.toLocaleString()}</strong><span>PLAY POINTS</span></div>
      </div>)}</div>
    </div>
  </section>;
}

function Tournaments({ user }) {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [seatCount, setSeatCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [reservation, setReservation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api("/tournaments")
      .then(setEvents)
      .catch(() => setMessage("Unable to load tournaments."));
  }, []);

  function openReservation(event) {
    if (!user) {
      navigate(`/login?redirect=/tournaments`);
      return;
    }

    setSelectedEvent(event);
    setSeatCount(1);
    setMessage("");
  }

  async function reserveTournamentSeats() {
    if (!selectedEvent || !user) return;

    setLoading(true);
    setMessage("");

    try {
      const result = await api("/tournament-reservations", {
        method: "POST",
        body: JSON.stringify({
          user_id: user.id,
          tournament_id: selectedEvent.id,
          seats: Number(seatCount)
        })
      });

      setReservation({
        ...result,
        tournament: selectedEvent
      });

      setSelectedEvent(null);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="page">

      <div className="page-hero tournament-hero">
        <span className="section-kicker">COMPETE</span>

        <h1>
          Turn gaming
          <br />
          <span>into a scene.</span>
        </h1>

        <p>
          Discover local tournaments and esports opportunities connected
          to the cafés you already play at.
        </p>
      </div>

      {message && (
        <p className="form-status error" role="alert">
          {message}
        </p>
      )}

      <div className="tournament-grid">

        {events.map(e => (

          <article
            className="tournament-card"
            key={e.id}
          >

            {/* Tournament image */}
            <div className="tournament-art tournament-image-art">

              <img
                src={e.image}
                alt={`${e.title} tournament`}
              />

              <div className="tournament-image-overlay" />

              <div className="tournament-art-content">
                <Trophy size={40} />

                <span>
                  {e.type}
                </span>
              </div>

            </div>

            <div className="tournament-body">

              <div className="event-meta">
                <span>{e.game}</span>
                <span>{e.date}</span>
              </div>

              <h2>
                {e.title}
              </h2>

              <div className="event-stats">

                <div>
                  <small>PRIZE POOL</small>
                  <strong>{e.prize}</strong>
                </div>

                <div>
                  <small>OPEN SPOTS</small>
                  <strong>{e.spots}</strong>
                </div>

              </div>

              <button
                className="btn btn-primary full"
                onClick={() => openReservation(e)}
              >
                Reserve tournament seats
                <ArrowRight size={16} />
              </button>

            </div>

          </article>

        ))}

      </div>

      {/* Reservation popup */}

      {selectedEvent && (

        <div className="modal-backdrop">

          <div
            className="tournament-reservation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tournament-reservation-title"
          >

            <button
              className="modal-close"
              onClick={() => setSelectedEvent(null)}
              aria-label="Close"
            >
              <X />
            </button>

            <div className="tournament-modal-icon">
              <Trophy size={28} />
            </div>

            <span className="section-kicker">
              TOURNAMENT RESERVATION
            </span>

            <h2 id="tournament-reservation-title">
              Reserve your seats
            </h2>

            <p>
              {selectedEvent.title}
            </p>

            <div className="tournament-modal-details">

              <div>
                <span>GAME</span>
                <strong>{selectedEvent.game}</strong>
              </div>

              <div>
                <span>DATE</span>
                <strong>{selectedEvent.date}</strong>
              </div>

              <div>
                <span>TYPE</span>
                <strong>{selectedEvent.type}</strong>
              </div>

            </div>

            <label className="tournament-seat-select">
              Number of seats

              <select
                value={seatCount}
                onChange={e => setSeatCount(Number(e.target.value))}
              >
                {Array.from(
                  {
                    length: Math.min(
                      8,
                      selectedEvent.spots
                    )
                  },
                  (_, i) => i + 1
                ).map(number => (
                  <option
                    value={number}
                    key={number}
                  >
                    {number} {number === 1 ? "seat" : "seats"}
                  </option>
                ))}
              </select>

            </label>

            <p className="whatsapp-note">
              Your seats will only be reserved.
              Further tournament details, timings and joining
              instructions will be sent to you on WhatsApp.
            </p>

            <button
              className="btn btn-primary full"
              onClick={reserveTournamentSeats}
              disabled={loading}
            >
              {loading
                ? "Reserving..."
                : `Reserve ${seatCount} ${
                    seatCount === 1 ? "seat" : "seats"
                  }`
              }

              <Check size={17} />
            </button>

          </div>

        </div>

      )}

      {/* Reservation success popup */}

      {reservation && (

        <div className="modal-backdrop">

          <div
            className="success-modal tournament-success-modal"
            role="dialog"
            aria-modal="true"
          >

            <div className="success-icon">
              <Check size={32} />
            </div>

            <span className="section-kicker">
              SEATS RESERVED
            </span>

            <h2>
              You're on the list.
            </h2>

            <p>
              {reservation.seats}{" "}
              {reservation.seats === 1 ? "seat has" : "seats have"} been
              reserved for:
            </p>

            <div className="reservation-confirmation">

              <strong>
                {reservation.tournament.title}
              </strong>

              <span>
                {reservation.tournament.game}
              </span>

              <span>
                {reservation.tournament.date}
              </span>

              <span>
                {reservation.seats}{" "}
                {reservation.seats === 1 ? "seat" : "seats"}
              </span>

              <span>
                Reservation ID:{" "}
                TR-{String(reservation.reservation_id).padStart(5, "0")}
              </span>

            </div>

            <div className="whatsapp-success">

              <span>WHATSAPP UPDATE</span>

              <p>
                More tournament details, timings and joining
                instructions will be sent to you on WhatsApp.
              </p>

            </div>

            <button
              className="btn btn-primary full"
              onClick={() => setReservation(null)}
            >
              Done
              <Check size={17} />
            </button>

          </div>

        </div>

      )}

    </section>
  );
}
function FloatingBook(){return <Link className="floating-book" to="/cafes"><CalendarDays size={20}/><span>Book a slot</span></Link>;}
function Loading(){return <div className="loading" role="status"><div className="spinner"/>Loading PlayIRL...</div>;}
function Footer(){return <footer><div className="footer-brand"><span className="brand-mark"><Gamepad2 size={19}/></span><strong>PlayIRL</strong><p>Play. Learn. Earn.</p></div><div><strong>Platform</strong><Link to="/cafes">Cafés</Link><Link to="/tournaments">Tournaments</Link><Link to="/premium">Premium</Link></div><div><strong>Account</strong><Link to="/dashboard">Dashboard</Link><Link to="/login">Log in</Link><Link to="/signup">Sign up</Link></div><div className="footer-note"><ShieldCheck size={18}/><span>Designed with keyboard, screen-reader and contrast accessibility in mind.</span></div></footer>;}

createRoot(document.getElementById("root")).render(<BrowserRouter><App/></BrowserRouter>);
