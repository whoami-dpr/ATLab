from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import fastf1
from datetime import datetime
import math

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "F1 Telemetry API is running!"}

@app.get("/api/f1/years")
def get_years():
    # FastF1 soporta desde 2018 en adelante
    start_year = 2018
    current_year = datetime.now().year
    return {"years": list(range(start_year, current_year + 1))}

@app.get("/api/f1/gps")
def get_gps(year: int = Query(...)):
    try:
        schedule = fastf1.get_event_schedule(year)
        gps = [row['EventName'] for _, row in schedule.iterrows()]
        return {"gps": gps}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/f1/sessions")
def get_sessions(year: int = Query(...), gp: str = Query(...)):
    try:
        event = fastf1.get_event(year, gp)
        print("EVENTO:", event)  # Depuración
        if event is None or not hasattr(event, 'keys'):
            return {"sessions": []}
        # Extraer todas las claves que empiezan con 'Session' y no terminan en 'Date' ni 'DateUtc'
        session_names = []
        for key in event.keys():
            if key.startswith("Session") and not key.endswith("Date") and not key.endswith("DateUtc"):
                value = event[key]
                if isinstance(value, str) and value.strip():
                    session_names.append(value)
        return {"sessions": session_names}
    except Exception as e:
        print("ERROR EN SESSIONS:", e)
        return {"sessions": []}

@app.get("/api/f1/drivers")
def get_drivers(year: int = Query(...), gp: str = Query(...), session: str = Query(...)):
    try:
        print(f"GET DRIVERS: year={year}, gp={gp}, session={session}")
        ses = fastf1.get_session(year, gp, session)
        ses.load()
        print("LAPS:", ses.laps)
        if ses.laps.empty:
            print("NO LAPS FOUND")
            return {"drivers": []}
        drivers = ses.laps['Driver'].unique().tolist()
        print("UNIQUE DRIVERS:", drivers)
        driver_info = ses.drivers
        print("DRIVER INFO:", driver_info)
        driver_list = []
        for drv in drivers:
            name = drv
            # Si driver_info es un dict
            if isinstance(driver_info, dict):
                info = driver_info.get(drv, {})
                name = info.get("full_name", drv)
            # Si driver_info es una lista de dicts
            elif isinstance(driver_info, list) and len(driver_info) > 0 and isinstance(driver_info[0], dict):
                found = next((d for d in driver_info if d.get("abbreviation") == drv), None)
                if found:
                    name = found.get("full_name", drv)
            # Si driver_info es una lista de strings (números de auto)
            elif isinstance(driver_info, list) and len(driver_info) > 0 and isinstance(driver_info[0], str):
                name = drv  # Solo el código
            driver_list.append({
                "code": drv,
                "name": name
            })
        print("DRIVERS:", driver_list)
        return {"drivers": driver_list}
    except Exception as e:
        print("ERROR EN DRIVERS:", e)
        return {"drivers": []}

@app.get("/api/test")
def test_fastf1():
    try:
        print("TESTING FASTF1 WITH 2023 BAHRAIN")
        ses = fastf1.get_session(2023, "Bahrain Grand Prix", "R")
        print(f"SESSION CREATED: {ses}")
        ses.load()
        print(f"SESSION LOADED SUCCESSFULLY")
        print(f"TOTAL LAPS: {len(ses.laps)}")
        print(f"DRIVERS: {ses.laps['Driver'].unique()}")
        ver_laps = ses.laps.pick_driver("VER")
        print(f"VER LAPS: {len(ver_laps)}")
        return {
            "success": True,
            "total_laps": len(ses.laps),
            "drivers": ses.laps['Driver'].unique().tolist(),
            "ver_laps": len(ver_laps)
        }
    except Exception as e:
        print(f"TEST ERROR: {e}")
        return {"success": False, "error": str(e)}

@app.get("/api/telemetry/lap-data")
def get_lap_data(
    year: int = Query(...),
    gp: str = Query(...),
    session: str = Query(...),
    driver: str = Query(...),
    lap: int = Query(None)
):
    try:
        print(f"GET TELEMETRY: year={year}, gp={gp}, session={session}, driver={driver}, lap={lap}")
        ses = fastf1.get_session(year, gp, session)
        ses.load()
        laps = ses.laps.pick_driver(driver)
        print(f"LAPS ENCONTRADAS: {len(laps)}")
        if laps.empty:
            print("NO LAPS FOUND")
            return {"error": "No data for this driver/session"}
        if lap is not None:
            laps = laps[laps["LapNumber"] == lap]
            print(f"LAPS FILTRADAS POR LAP={lap}: {len(laps)}")
            if laps.empty:
                print(f"NO DATA FOR LAP {lap}")
                return {"error": f"No data for lap {lap}"}
        lap_row = laps.iloc[0]
        tel = lap_row.get_car_data().add_distance()
        rpm = tel["RPM"].tolist() if "RPM" in tel else [0] * len(tel)
        gear = tel["nGear"].tolist() if "nGear" in tel else [0] * len(tel)
        drs = tel["DRS"].tolist() if "DRS" in tel else [0] * len(tel)
        print(f"TELEMETRY ROWS: {len(tel)}")
        return {
            "distance": tel['Distance'].tolist(),
            "speed": tel['Speed'].tolist(),
            "throttle": tel['Throttle'].tolist(),
            "brake": tel['Brake'].tolist(),
            "rpm": rpm,
            "gear": gear,
            "drs": drs,
            "time": tel['Time'].astype(str).tolist(),
        }
    except Exception as e:
        print(f"ERROR EN TELEMETRY: {e}")
        return {"error": str(e)}

@app.get("/api/telemetry/laps")
def get_laps(
    year: int = Query(...),
    gp: str = Query(...),
    session: str = Query(...),
    driver: str = Query(...)
):
    try:
        print(f"GET LAPS: year={year}, gp={gp}, session={session}, driver={driver}")
        ses = fastf1.get_session(year, gp, session)
        print(f"SESSION LOADED: {ses}")
        ses.load()
        print(f"SESSION LOADED WITH DATA")
        laps = ses.laps.pick_driver(driver)
        print(f"LAPS FOR DRIVER {driver}: {len(laps)} laps")
        if laps.empty:
            print(f"NO LAPS FOUND FOR DRIVER {driver}")
            return {"laps": []}
        lap_list = []
        for _, lap in laps.iterrows():
            lap_time = float(lap["LapTime"].total_seconds()) if lap["LapTime"] is not None else None
            if lap_time is not None and (math.isnan(lap_time) or math.isinf(lap_time)):
                lap_time = None
            lap_list.append({
                "lapNumber": int(lap["LapNumber"]),
                "lapTimeSeconds": lap_time,
                "lapTimeStr": str(lap["LapTime"]) if lap["LapTime"] is not None else None,
                "lapStartTime": str(lap["StartTime"]) if "StartTime" in lap else "",
                "isValid": bool(lap["IsAccurate"]) if "IsAccurate" in lap else True,
            })
        print(f"RETURNING {len(lap_list)} LAPS")
        return {"laps": lap_list}
    except Exception as e:
        print(f"ERROR EN LAPS: {e}")
        return {"error": str(e)}
