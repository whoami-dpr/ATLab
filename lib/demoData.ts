// Demo data para F1 Live Timing
import type { F1Driver, F1SessionInfo } from '../hooks/useF1SignalR'

export const getDemoDrivers = (driverColors: string[]): F1Driver[] => [
  {
    pos: 1,
    code: "VER",
    name: "Max Verstappen",
    team: "Red Bull",
    color: driverColors[0],
    tire: "S",
    stint: "L 15",
    change: "+0.234",
    drs: true,
    gap: "LEADER",
    gapTime: "",
    lapTime: "1:18.234",
    prevLap: "1:18.456",
    sector1: "23.456",
    sector1Prev: "23.678",
    sector2: "31.234",
    sector2Prev: "31.456",
    sector3: "23.544",
    sector3Prev: "23.322",
    sector1Color: "green",
    sector2Color: "yellow",
    sector3Color: "purple",
  },
  {
    pos: 2,
    code: "HAM",
    name: "Lewis Hamilton",
    team: "Mercedes",
    color: driverColors[1],
    tire: "M",
    stint: "L 18",
    change: "-0.123",
    drs: false,
    gap: "+0.234",
    gapTime: "+0.234",
    lapTime: "1:18.468",
    prevLap: "1:18.591",
    sector1: "23.567",
    sector1Prev: "23.789",
    sector2: "31.345",
    sector2Prev: "31.567",
    sector3: "23.556",
    sector3Prev: "23.235",
    sector1Color: "yellow",
    sector2Color: "green",
    sector3Color: "yellow",
  },
  {
    pos: 3,
    code: "LEC",
    name: "Charles Leclerc",
    team: "Ferrari",
    color: driverColors[2],
    tire: "S",
    stint: "L 12",
    change: "+0.456",
    drs: true,
    gap: "+0.789",
    gapTime: "+0.555",
    lapTime: "1:18.789",
    prevLap: "1:18.234",
    sector1: "23.678",
    sector1Prev: "23.456",
    sector2: "31.456",
    sector2Prev: "31.234",
    sector3: "23.655",
    sector3Prev: "23.544",
    sector1Color: "purple",
    sector2Color: "yellow",
    sector3Color: "green",
  },
  {
    pos: 4,
    code: "NOR",
    name: "Lando Norris",
    team: "McLaren",
    color: driverColors[3],
    tire: "M",
    stint: "L 20",
    change: "-0.234",
    drs: false,
    gap: "+1.234",
    gapTime: "+0.445",
    lapTime: "1:19.023",
    prevLap: "1:18.789",
    sector1: "23.789",
    sector1Prev: "23.567",
    sector2: "31.567",
    sector2Prev: "31.345",
    sector3: "23.667",
    sector3Prev: "23.877",
    sector1Color: "yellow",
    sector2Color: "purple",
    sector3Color: "green",
  },
  {
    pos: 5,
    code: "RUS",
    name: "George Russell",
    team: "Mercedes",
    color: driverColors[4],
    tire: "H",
    stint: "L 25",
    change: "+0.123",
    drs: false,
    gap: "+2.456",
    gapTime: "+1.222",
    lapTime: "1:19.456",
    prevLap: "1:19.023",
    sector1: "23.890",
    sector1Prev: "23.678",
    sector2: "31.678",
    sector2Prev: "31.456",
    sector3: "23.888",
    sector3Prev: "23.889",
    sector1Color: "green",
    sector2Color: "yellow",
    sector3Color: "yellow",
  },
  {
    pos: 6,
    code: "PIA",
    name: "Oscar Piastri",
    team: "McLaren",
    color: driverColors[5],
    tire: "M",
    stint: "L 16",
    change: "+0.345",
    drs: true,
    gap: "+3.123",
    gapTime: "+0.667",
    lapTime: "1:19.567",
    prevLap: "1:19.234",
    sector1: "23.901",
    sector1Prev: "23.789",
    sector2: "31.789",
    sector2Prev: "31.567",
    sector3: "23.877",
    sector3Prev: "23.878",
    sector1Color: "yellow",
    sector2Color: "green",
    sector3Color: "purple",
  },
  {
    pos: 7,
    code: "PER",
    name: "Sergio Perez",
    team: "Red Bull",
    color: driverColors[6],
    tire: "S",
    stint: "L 13",
    change: "-0.456",
    drs: false,
    gap: "+4.567",
    gapTime: "+1.444",
    lapTime: "1:19.678",
    prevLap: "1:19.345",
    sector1: "24.012",
    sector1Prev: "23.890",
    sector2: "31.890",
    sector2Prev: "31.678",
    sector3: "23.776",
    sector3Prev: "23.777",
    sector1Color: "purple",
    sector2Color: "yellow",
    sector3Color: "green",
  },
  {
    pos: 8,
    code: "SAI",
    name: "Carlos Sainz",
    team: "Ferrari",
    color: driverColors[7],
    tire: "M",
    stint: "L 19",
    change: "+0.567",
    drs: true,
    gap: "+5.234",
    gapTime: "+0.667",
    lapTime: "1:19.789",
    prevLap: "1:19.456",
    sector1: "24.123",
    sector1Prev: "23.901",
    sector2: "31.901",
    sector2Prev: "31.789",
    sector3: "23.765",
    sector3Prev: "23.766",
    sector1Color: "green",
    sector2Color: "purple",
    sector3Color: "yellow",
  },
  {
    pos: 9,
    code: "ALO",
    name: "Fernando Alonso",
    team: "Aston Martin",
    color: driverColors[8],
    tire: "H",
    stint: "L 22",
    change: "-0.678",
    drs: false,
    gap: "+6.789",
    gapTime: "+1.555",
    lapTime: "1:19.890",
    prevLap: "1:19.567",
    sector1: "24.234",
    sector1Prev: "24.012",
    sector2: "32.012",
    sector2Prev: "31.890",
    sector3: "23.644",
    sector3Prev: "23.665",
    sector1Color: "yellow",
    sector2Color: "green",
    sector3Color: "purple",
  },
  {
    pos: 10,
    code: "STR",
    name: "Lance Stroll",
    team: "Aston Martin",
    color: driverColors[9],
    tire: "M",
    stint: "L 17",
    change: "+0.789",
    drs: true,
    gap: "+7.456",
    gapTime: "+0.667",
    lapTime: "1:19.901",
    prevLap: "1:19.678",
    sector1: "24.345",
    sector1Prev: "24.123",
    sector2: "32.123",
    sector2Prev: "31.901",
    sector3: "23.433",
    sector3Prev: "23.654",
    sector1Color: "purple",
    sector2Color: "yellow",
    sector3Color: "green",
  },
  {
    pos: 11,
    code: "GAS",
    name: "Pierre Gasly",
    team: "Alpine",
    color: driverColors[10],
    tire: "S",
    stint: "L 14",
    change: "-0.890",
    drs: false,
    gap: "+8.123",
    gapTime: "+0.667",
    lapTime: "1:20.012",
    prevLap: "1:19.789",
    sector1: "24.456",
    sector1Prev: "24.234",
    sector2: "32.234",
    sector2Prev: "32.012",
    sector3: "23.322",
    sector3Prev: "23.543",
    sector1Color: "green",
    sector2Color: "purple",
    sector3Color: "yellow",
  },
  {
    pos: 12,
    code: "OCO",
    name: "Esteban Ocon",
    team: "Alpine",
    color: driverColors[11],
    tire: "M",
    stint: "L 21",
    change: "+0.901",
    drs: true,
    gap: "+8.890",
    gapTime: "+0.767",
    lapTime: "1:20.123",
    prevLap: "1:19.890",
    sector1: "24.567",
    sector1Prev: "24.345",
    sector2: "32.345",
    sector2Prev: "32.123",
    sector3: "23.211",
    sector3Prev: "23.422",
    sector1Color: "yellow",
    sector2Color: "green",
    sector3Color: "purple",
  },
  {
    pos: 13,
    code: "HUL",
    name: "Nico Hulkenberg",
    team: "Haas",
    color: driverColors[12],
    tire: "H",
    stint: "L 24",
    change: "-1.012",
    drs: false,
    gap: "+9.567",
    gapTime: "+0.677",
    lapTime: "1:20.234",
    prevLap: "1:19.901",
    sector1: "24.678",
    sector1Prev: "24.456",
    sector2: "32.456",
    sector2Prev: "32.234",
    sector3: "23.100",
    sector3Prev: "23.211",
    sector1Color: "purple",
    sector2Color: "yellow",
    sector3Color: "green",
  },
  {
    pos: 14,
    code: "MAG",
    name: "Kevin Magnussen",
    team: "Haas",
    color: driverColors[13],
    tire: "M",
    stint: "L 18",
    change: "+1.123",
    drs: true,
    gap: "+10.234",
    gapTime: "+0.667",
    lapTime: "1:20.345",
    prevLap: "1:20.012",
    sector1: "24.789",
    sector1Prev: "24.567",
    sector2: "32.567",
    sector2Prev: "32.345",
    sector3: "22.989",
    sector3Prev: "23.100",
    sector1Color: "green",
    sector2Color: "purple",
    sector3Color: "yellow",
  },
  {
    pos: 15,
    code: "TSU",
    name: "Yuki Tsunoda",
    team: "RB",
    color: driverColors[14],
    tire: "S",
    stint: "L 15",
    change: "-1.234",
    drs: false,
    gap: "+11.123",
    gapTime: "+0.889",
    lapTime: "1:20.456",
    prevLap: "1:20.123",
    sector1: "24.890",
    sector1Prev: "24.678",
    sector2: "32.678",
    sector2Prev: "32.456",
    sector3: "22.888",
    sector3Prev: "22.989",
    sector1Color: "yellow",
    sector2Color: "green",
    sector3Color: "purple",
  },
  {
    pos: 16,
    code: "LAW",
    name: "Liam Lawson",
    team: "RB",
    color: driverColors[15],
    tire: "M",
    stint: "L 20",
    change: "+1.345",
    drs: true,
    gap: "+12.456",
    gapTime: "+1.333",
    lapTime: "1:20.567",
    prevLap: "1:20.234",
    sector1: "24.901",
    sector1Prev: "24.789",
    sector2: "32.789",
    sector2Prev: "32.567",
    sector3: "22.877",
    sector3Prev: "22.888",
    sector1Color: "purple",
    sector2Color: "yellow",
    sector3Color: "green",
  },
  {
    pos: 17,
    code: "ALB",
    name: "Alex Albon",
    team: "Williams",
    color: driverColors[16],
    tire: "H",
    stint: "L 23",
    change: "-1.456",
    drs: false,
    gap: "+13.789",
    gapTime: "+1.333",
    lapTime: "1:20.678",
    prevLap: "1:20.345",
    sector1: "25.012",
    sector1Prev: "24.890",
    sector2: "32.890",
    sector2Prev: "32.678",
    sector3: "22.776",
    sector3Prev: "22.877",
    sector1Color: "green",
    sector2Color: "purple",
    sector3Color: "yellow",
  },
  {
    pos: 18,
    code: "COL",
    name: "Franco Colapinto",
    team: "Williams",
    color: driverColors[17],
    tire: "M",
    stint: "L 19",
    change: "+1.567",
    drs: true,
    gap: "+14.567",
    gapTime: "+0.778",
    lapTime: "1:20.789",
    prevLap: "1:20.456",
    sector1: "25.123",
    sector1Prev: "24.901",
    sector2: "32.901",
    sector2Prev: "32.789",
    sector3: "22.765",
    sector3Prev: "22.776",
    sector1Color: "yellow",
    sector2Color: "green",
    sector3Color: "purple",
  },
  {
    pos: 19,
    code: "BOT",
    name: "Valtteri Bottas",
    team: "Kick Sauber",
    color: driverColors[18],
    tire: "S",
    stint: "L 16",
    change: "-1.678",
    drs: false,
    gap: "+15.234",
    gapTime: "+0.667",
    lapTime: "1:20.890",
    prevLap: "1:20.567",
    sector1: "25.234",
    sector1Prev: "25.012",
    sector2: "33.012",
    sector2Prev: "32.890",
    sector3: "22.644",
    sector3Prev: "22.765",
    sector1Color: "purple",
    sector2Color: "yellow",
    sector3Color: "green",
  },
  {
    pos: 20,
    code: "ZHO",
    name: "Zhou Guanyu",
    team: "Kick Sauber",
    color: driverColors[19],
    tire: "M",
    stint: "L 22",
    change: "+1.789",
    drs: true,
    gap: "+16.789",
    gapTime: "+1.555",
    lapTime: "1:20.901",
    prevLap: "1:20.678",
    sector1: "25.345",
    sector1Prev: "25.123",
    sector2: "33.123",
    sector2Prev: "32.901",
    sector3: "22.433",
    sector3Prev: "22.644",
    sector1Color: "green",
    sector2Color: "purple",
    sector3Color: "yellow",
  },
];

export const getDemoSessionInfo = (): F1SessionInfo => ({
  raceName: "DEMO: British Grand Prix",
  flag: "🟢",
  timer: "01:23:45",
  weather: {
    track: 32,
    air: 24,
    humidity: 65,
    condition: "dry",
  },
  lapInfo: "45 / 52",
  trackStatus: "Green Flag",
}); 