import { useState, useContext, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./css/UserPerformance.css";
import { UserContext } from "../contexts/UserContext";
import axios from "axios";

/* ======================================================================
   DUMMY DATA
   ----------------------------------------------------------------------*/

// 1) Top summary cards ka data
// API suggestion: GET /api/performance/summary

// 2) Marks Trend (Line Chart) ka data
// API suggestion: GET /api/performance/marks-trend?range=1Y
// const marksTrendData = {marksTrend};

// 3) Rank Trend (Line Chart, lower is better) ka data
// API suggestion: GET /api/performance/rank-trend?range=1Y
const rankTrendData = [
  { month: "Jan", rank: 70 },
  { month: "Feb", rank: 60 },
  { month: "Mar", rank: 50 },
  { month: "Apr", rank: 45 },
  { month: "May", rank: 40 },
  { month: "Jun", rank: 35 },
  { month: "Jul", rank: 30 },
  { month: "Aug", rank: 25 },
  { month: "Sep", rank: 20 },
  { month: "Oct", rank: 15 },
  { month: "Nov", rank: 10 },
  { month: "Dec", rank: 5 },
];

// 4) Accuracy vs Time (Bar Chart) ka data
// API suggestion: GET /api/performance/accuracy-vs-time
const accuracyTimeData = [
  { time: "0-3 min", value: 90 },
  { time: "3-6 min", value: 85 },
  { time: "6-9 min", value: 75 },
  { time: "9-12 min", value: 60 },
  { time: "12-15 min", value: 55 },
  { time: "15-19 min", value: 45 },
];

// 5) Consistency Donut Chart ka data
// API suggestion: GET /api/performance/consistency
const consistencyData = [
  { name: "Attempted", value: 80 },
  { name: "Missed", value: 20 },
];
const totalTestsAssigned = 10;

// 6) Test Type Distribution (Donut) ka data
// API suggestion: GET /api/performance/test-type-distribution
const testTypeData = [
  { name: "Institutional", value: 35, color: "#25518d" },
  { name: "Interest Based", value: 25, color: "#43a047" },
  { name: "Mock", value: 20, color: "#31b3c4" },
  { name: "General", value: 20, color: "#e0a339" },
];

// 7) Language Distribution (Donut) ka data
// API suggestion: GET /api/performance/language-distribution
const languageData = [
  { name: "English", value: 60, color: "#25518d" },
  { name: "Hindi", value: 40, color: "#43a047" },
];

const CONSISTENCY_COLORS = ["#43a047", "#c0392b"];
const RANGE_TABS = [
  "1W",
  "1M",
  "3M",
  "6M",
  "9M",
  "1Y",
  "2Y",
  "3Y",
  "4Y",
  "5Y",
  "All",
];

/* ======================================================================
   REUSABLE SMALL COMPONENTS
   ====================================================================== */

// Range tabs (1W, 1M, 3M ...) -- onClick lag chuka hai, click karne par
// call kar dena (neeche MAIN COMPONENT me TODO comment diya hai).
function RangeTabs({ selectedRange, onRangeChange }) {
  return (
    <div className="range-tabs">
      {RANGE_TABS.map((tab) => (
        <button
          key={tab}
          className={`range-tab ${tab === selectedRange ? "active" : ""}`}
          onClick={() => onRangeChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

function SummaryCard({ icon, title, valueClass, value, cardClass, children }) {
  return (
    <div className={`summary-card ${cardClass}`}>
      <div className="summary-card-header">
        <span className="summary-icon">{icon}</span>
        <h3>{title}</h3>
      </div>
      <div className={`summary-value ${valueClass}`}>{value}</div>
      <div className="summary-sub">{children}</div>
    </div>
  );
}

function DonutLegend({ items }) {
  return (
    <ul className="donut-legend">
      {items.map((item) => (
        <li key={item.name}>
          <span
            className="legend-dot"
            style={{ backgroundColor: item.color }}
          />
          <span className="legend-name">{item.name}</span>
          <span className="legend-value">{item.value}%</span>
        </li>
      ))}
    </ul>
  );
}

/* ======================================================================
   MAIN COMPONENT
   ====================================================================== */

export default function UserPerformance() {
  // Marks Trend aur Rank Trend, dono ka apna-apna selected range track
  // hota hai (default "1Y"). Click karne par ye state update hota hai.
  const [marksRange, setMarksRange] = useState("1Y");
  const [rankRange, setRankRange] = useState("1Y");
  const { user } = useContext(UserContext);
  const API_URL = process.env.REACT_APP_API_URL;
  const [marksTrend, setMarksTrend] = useState([]);
  const [accuracyTrend, setAccuracyTrend] = useState([]);
  const [rankTrend, setRankTrend] = useState([]);
  const [consistency, setConsistency] = useState({
    assigned: 0,
    attempted: 0,
    missed: 0,
    consistency: 0,
  });
  const pieData = [
    {
      name: "Attempted",
      value: consistency.attemptedTests,
    },

    {
      name: "Missed",
      value: consistency.missedTests,
    },
  ];
  const TEST_TYPE_COLORS = [
    "#3b82f6", // Institution (Blue)
    "#22c55e", // Interest (Green)
    "#f59e0b", // Global (Orange)
  ];

  const LANGUAGE_COLORS = [
    "#2563eb", // English - Blue
    "#f97316", // Hindi - Orange
  ];

  const [testTypeData, setTestTypeData] = useState([]);
  const [languageData, setLanguageData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    bestRank: 0,
    averageRank: 0,
    accuracy: 0,
    totalCorrect: 0,
    totalWrong: 0,
  });

  useEffect(() => {
    if (user) {
      getPerformanceSummary();

      getMarksTrend();

      //getAccuracyTrend();

      getConsistency();

      getTestTypeDistribution();

      getLanguageDistribution();

      getRankTrend();
    }
  }, [user]);

  const getPerformanceSummary = async () => {
    try {
      const res = await axios.get(`${API_URL}/performance/summary/${user.id}`);

      console.log("Performance Summary:", res.data);

      if (res.data.success) {
        setSummaryData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getMarksTrend = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/performance/marks-trend/${user.id}`,
      );

      if (res.data.success) {
        console.log(res.data.data);
        setMarksTrend(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getAccuracyTrend = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/performance/accuracy-trend/${user.id}`,
      );

      if (res.data.success) {
        setAccuracyTrend(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getConsistency = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/performance/consistency/${user.id}`,
      );

      if (res.data.success) {
        console.log("Consistency", res.data.data);

        setConsistency(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getTestTypeDistribution = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/performance/test-type-distribution/${user.id}`,
      );

      if (res.data.success) {
        console.log("Test Type", res.data);

        const data = [
          {
            name: "Institution",
            value: res.data.data.Institution,
          },
          {
            name: "Interest",
            value: res.data.data.Interest,
          },
          {
            name: "Global",
            value: res.data.data.Global,
          },
        ];

        setTestTypeData(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getLanguageDistribution = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/performance/language-distribution/${user.id}`,
      );

      if (res.data.success) {
        console.log("Test Lang", res.data);

        setLanguageData([
          {
            name: "English",
            value: res.data.data.english,
          },
          {
            name: "Hindi",
            value: res.data.data.hindi,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRankTrend = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/performance/rank-trend/${user.id}`,
      );

      if (res.data.success) {
        setRankTrend(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dp-page">
      <div className="dp-container">
        {/* ---------- PAGE TITLE ---------- */}
        <div className="dp-title-bar">
          <h1>Detailed Performance</h1>
        </div>

        {/* ---------- SUMMARY CARDS ---------- */}
        <div className="dp-grid dp-grid-3">
          <SummaryCard
            icon="📈"
            title="Average Score"
            valueClass="text-blue"
            cardClass="summary-card-score"
            value={`${summaryData.averageScore}%`}
          >
            Highest:{" "}
            <span className="text-green">{summaryData.highestScore}%</span> |
            Lowest: <span className="text-red">{summaryData.lowestScore}%</span>
          </SummaryCard>

          <SummaryCard
            icon="🏆"
            title="Rank Status"
            valueClass="text-purple"
            cardClass="summary-card-rank"
            value={`#${summaryData.bestRank}`}
          >
            Best Rank Achieved
            <br />
            Average Rank: #{summaryData.averageRank}
          </SummaryCard>

          <SummaryCard
            icon="🎯"
            title="Accuracy"
            valueClass="text-green"
            cardClass="summary-card-accuracy"
            value={`${summaryData.accuracy}%`}
          >
            {/* Correct Answer Ratio */}
            <br />
            Total Correct:{" "}
            <span className="text-green">{summaryData.totalCorrect}</span> Total
            Wrong: <span className="text-red">{summaryData.totalWrong}</span>
          </SummaryCard>
        </div>

        {/* ---------- CHARTS ROW 1 ---------- */}
        <div className="dp-grid dp-grid-2">
          {/* Marks Trend */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h4>Marks Trend (Score %)</h4>
              {/* <RangeTabs selectedRange={marksRange} onRangeChange={setMarksRange} /> */}
            </div>
            {/* <p className="chart-subtitle">Average monthly score (Last 1 Year)</p> */}
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={marksTrend}
                margin={{
                  top: 20,
                  right: 20,
                  left: 20,
                  bottom: 35,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                {/* <XAxis dataKey="month" fontSize={11} /> */}
                <XAxis
                  dataKey="testId"
                  tickFormatter={(value) => `Q${value}`}
                  interval={0}
                  minTickGap={10}
                  fontSize={11}
                  label={{
                    value: "Quizzes",
                    position: "bottom",
                    offset: 10,
                  }}
                />
                <YAxis
                  fontSize={11}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                  label={{
                    value: "Obtained Marks (%)",
                    angle: -90,
                    position: "center",
                    dx: -20,
                    fontSize: 11,
                    fill: "#2f415a",
                  }}
                />
                <Tooltip
                  formatter={(value) => [`${value}%`, "Marks"]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return `Quiz ID: ${label} - ${payload[0].payload.testName}`;
                    }
                    return label;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
            {/* <div className="chart-footer">Average Score : {`${summaryData.averageScore}%`}</div> */}
          </div>

          {/* Rank Trend */}
          <div className="chart-card">
            <div className="chart-card-header">
              <h4>Rank Trend</h4>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={rankTrend}
                margin={{
                  top: 20,
                  right: 20,
                  left: 20,
                  bottom: 35,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />

                <XAxis
                  dataKey="testId"
                  tickFormatter={(value) => `Q${value}`}
                  interval={0}
                  minTickGap={10}
                  fontSize={11}
                  label={{
                    value: "Quizzes",
                    position: "bottom",
                    offset: 10,
                  }}
                />

                <YAxis
                  reversed
                  allowDecimals={false}
                  fontSize={11}
                  label={{
                    value: "Rank",
                    angle: -90,
                    position: "center",
                    dx: -20,
                  }}
                />

                <Tooltip
                  formatter={(value) => [`Rank ${value}`, "Rank"]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return `Quiz ID: ${label} - ${payload[0].payload.testName}`;
                    }

                    return label;
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="rank"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="chart-footer">Lower Rank is Better</div>
          </div>

          {/* Accuracy vs Time */}
          {/* <div className="chart-card">
            <div className="chart-card-header">
              <h4>Accuracy Trend (%)</h4>
            </div> */}
          {/* <p className="chart-subtitle">Average correct answers based on test completion time</p> */}
          {/* <ResponsiveContainer width="100%" height={250}>
              <LineChart data={accuracyTrend}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="testId"
                  tickFormatter={(value) => `Q${value}`}
                  fontSize={10}
                />

                <YAxis
                  domain={[0, 100]}
                  fontSize={11}
                />

                <Tooltip
                  formatter={(value) => [`${value}%`, "Accuracy"]}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) {
                      return `Quiz ID: ${label} - ${payload[0].payload.testName}`;
                    }
                    return label;
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#16a34a"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />

              </LineChart>
            </ResponsiveContainer>
          </div> */}
        </div>

        {/* ---------- CHARTS ROW 2 (DONUTS) ---------- */}
        <div className="dp-grid dp-grid-3">
          {/* Consistency */}
          <div className="chart-card">
            <h4>Consistency (Quizzes)</h4>

            <div className="donut-row">
              <div className="donut-wrapper">
                <ResponsiveContainer width={140} height={140}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      innerRadius={45}
                      outerRadius={65}
                      startAngle={90}
                      endAngle={-270}
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={entry.name}
                          fill={CONSISTENCY_COLORS[index]}
                        />
                      ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="donut-center-label">
                  <strong>{consistency.consistency}%</strong>
                  <span>Consistency</span>
                </div>
              </div>

              <ul className="donut-legend">
                <li>
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: CONSISTENCY_COLORS[0] }}
                  />
                  Attempted {consistency.attemptedTests} Tests (
                  {consistency.consistency}%)
                </li>

                <li>
                  <span
                    className="legend-dot"
                    style={{ backgroundColor: CONSISTENCY_COLORS[1] }}
                  />
                  Missed {consistency.missedTests} Tests (
                  {(100 - consistency.consistency).toFixed(2)}%)
                </li>
              </ul>
            </div>

            <div className="chart-footer">
              Total Tests Assigned: {consistency.assignedTests}
            </div>
          </div>
          {/* Test Type Distribution */}
          <div className="chart-card">
            <h4>Test Type Distribution</h4>
            <div className="donut-row">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={testTypeData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={65}
                  >
                    {testTypeData.map((entry, index) => (
                      <Cell key={entry.name} fill={TEST_TYPE_COLORS[index]} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="donut-legend">
                {testTypeData.map((item, index) => (
                  <li key={item.name}>
                    <span
                      className="legend-dot"
                      style={{
                        backgroundColor: TEST_TYPE_COLORS[index],
                      }}
                    />
                    {item.name}: {item.value}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Language Distribution */}
          <div className="chart-card">
            <h4>Language Distribution</h4>
            <div className="donut-row">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={languageData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={65}
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={entry.name} fill={LANGUAGE_COLORS[index]} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <ul className="donut-legend">
                {languageData.map((item, index) => (
                  <li key={item.name}>
                    <span
                      className="legend-dot"
                      style={{
                        backgroundColor: LANGUAGE_COLORS[index],
                      }}
                    />
                    {item.name}: {item.value} Tests
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
