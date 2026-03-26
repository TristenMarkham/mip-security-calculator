// Wait for dependencies to load completely
(function checkDependencies() {
  if (
    typeof React === "undefined" ||
    typeof ReactDOM === "undefined" ||
    typeof Chart === "undefined"
  ) {
    console.log("Waiting for dependencies to load...");
    setTimeout(checkDependencies, 100);
    return;
  }

  console.log("All dependencies loaded, initializing app...");
  initMIPCalculator();
})();

function initMIPCalculator() {
  Chart.defaults.color = "#ffffff";
  Chart.defaults.borderColor = "rgba(255, 255, 255, 0.1)";
  Chart.defaults.plugins.legend.labels.color = "#ffffff";
  Chart.defaults.plugins.tooltip.backgroundColor = "#1a365d";
  Chart.defaults.plugins.tooltip.titleColor = "#ffffff";
  Chart.defaults.plugins.tooltip.bodyColor = "#ffffff";

  function MIPCalculatorApp() {
    const [calculatorType, setCalculatorType] = React.useState("guard");
    const [clientView, setClientView] = React.useState(false);

    const toggleCalculator = () => {
      setCalculatorType((prevType) => prevType === "guard" ? "patrol" : "guard");
    };

    const toggleClientView = () => {
      setClientView((prevView) => !prevView);
    };

    return (
      <div className="p-6 max-w-6xl mx-auto rounded-lg shadow-md mt-4 mb-8 transition-all duration-300">
        <div className="header-container">
          <img src="https://lofthaus.s3.amazonaws.com/images/780527/4.png" alt="MIP Security Services Logo" className="header-logo" />
          <h1 className="header-title" href="">MIP Security Services</h1>
          <div className="toggle-row">
            <div className="left-toggle">
              <div className="flex items-center border-2 border-solid rounded-md p-2 header-toggle">
                <label htmlFor="calculatorToggle" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" id="calculatorToggle" className="sr-only"
                      checked={calculatorType === "patrol"} onChange={toggleCalculator} />
                    <div className={`block w-10 h-6 rounded-full transition ${calculatorType === "patrol" ? "bg-yellow-500" : "bg-green-600"}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${calculatorType === "patrol" ? "translate-x-4" : ""}`}></div>
                  </div>
                  <div className="ml-3 font-medium text-gray-700">
                    {calculatorType === "guard" ? "Guard" : "Patrol"}
                  </div>
                </label>
              </div>
            </div>
            <div className="right-toggle">
              <div className="flex items-center border-2 border-solid rounded-md p-2 header-toggle">
                <label htmlFor="clientViewToggle" className="flex items-center cursor-pointer">
                  <div className="mr-3 font-medium text-gray-700"></div>
                  <div className="relative">
                    <input type="checkbox" id="clientViewToggle" className="sr-only"
                      checked={clientView} onChange={toggleClientView} />
                    <div className={`block w-10 h-6 rounded-full transition ${clientView ? "bg-green-600" : "bg-blue-800"}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${clientView ? "translate-x-4" : ""}`}></div>
                  </div>
                  <div className="ml-2 font-medium text-gray-700">
                    {clientView ? "Client" : "M I P"}
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="transition-opacity duration-300" style={{ opacity: 1 }}>
          {calculatorType === "guard" ? (
            <MIPSecurityCalculator clientView={clientView} />
          ) : (
            <MIPPatrolCalculator clientView={clientView} />
          )}
        </div>

        <div className="text-center text-gray-500 text-xs mt-6">
          © 2025 MIP Security Services • Enhanced Security Services Calculator
        </div>
        <div className="text-center text-gray-400 text-xs mt-2">
          v3.05 - Combined Guard and Patrol Calculator
        </div>
      </div>
    );
  }

  //===================================================
  // GUARD CALCULATOR COMPONENT
  //===================================================
  function MIPSecurityCalculator({ clientView }) {
    const DEFAULT_PAY_RATES = { unarmed: 23.0, armed: 25.0, longArm: 26.0, protection: 27.0 };
    const W9_PAY_RATES = { unarmed: 30.0, armed: 33.0, longArm: 34.0, protection: 35.0 };
    const TARGET_BILL_RATES = { unarmed: 43.75, armed: 50.0, longArm: 55.0, protection: 75.0 };
    const TARGET_PROFIT_PERCENTAGES = { unarmed: 17.0, armed: 19.0, longArm: 22.0, protection: 30.0 };
    const W9_PROFIT_PERCENTAGES = { unarmed: 20.0, armed: 25.0, longArm: 26.0, protection: 30.0 };
    const VEHICLE_RATE = 10.0;
    const WARNING_PROFIT_PERCENTAGE = 10.0;
    const STANDARD_EXPENSE_FACTOR = 0.80;
    const W9_EXPENSE_FACTOR = 0.27;

    const [inputs, setInputs] = React.useState({
      serviceType: "unarmed", longArm: false, guards: 1,
      hoursPerDay: 8, daysPerWeek: 5,
      expenseFactor: STANDARD_EXPENSE_FACTOR, travelTime: 30,
      chargeTravel: false, vehicleNeeded: false, vehicleHours: 8,
      enableDiscounts: false,
      profitMargin: TARGET_PROFIT_PERCENTAGES.unarmed,
      isW9: false,
      payRates: {
        unarmed: DEFAULT_PAY_RATES.unarmed, armed: DEFAULT_PAY_RATES.armed,
        longArm: DEFAULT_PAY_RATES.longArm, protection: DEFAULT_PAY_RATES.protection
      }
    });

    const [results, setResults] = React.useState({
      hourlyCharge: 0, totalCharge: 0, mipCost: 0, laborCost: 0,
      vehicleCost: 0, travelCost: 0, profitAmount: 0, profitPercentage: 0,
      adjustedProfit: 0, adjustedProfitPercentage: 0,
      totalHours: 0, travelHours: 0, vehicleHours: 0,
      discount: 0, discountAmount: 0, weeklyRevenue: 0,
      discountApplied: false, hoursForDiscount: 0
    });

    const costChartRef = React.useRef(null);
    const breakdownChartRef = React.useRef(null);
    const costChartInstance = React.useRef(null);
    const breakdownChartInstance = React.useRef(null);

    function handleChange(e) {
      const { id, value, type, checked } = e.target;

      if (type === "checkbox") {
        if (id === "longArm") {
          setInputs({ ...inputs, [id]: checked,
            profitMargin: checked ? TARGET_PROFIT_PERCENTAGES.longArm : TARGET_PROFIT_PERCENTAGES.armed });
        } else if (id === "isW9") {
          const newPayRates = checked ? { ...W9_PAY_RATES } : { ...DEFAULT_PAY_RATES };
          let newProfitMargin;
          if (checked) {
            newProfitMargin = (inputs.serviceType === "armed" && inputs.longArm)
              ? W9_PROFIT_PERCENTAGES.longArm : W9_PROFIT_PERCENTAGES[inputs.serviceType];
          } else {
            newProfitMargin = (inputs.serviceType === "armed" && inputs.longArm)
              ? TARGET_PROFIT_PERCENTAGES.longArm : TARGET_PROFIT_PERCENTAGES[inputs.serviceType];
          }
          setInputs({ ...inputs, isW9: checked, payRates: newPayRates,
            profitMargin: newProfitMargin,
            expenseFactor: checked ? W9_EXPENSE_FACTOR : STANDARD_EXPENSE_FACTOR });
        } else {
          setInputs({ ...inputs, [id]: checked });
        }
        return;
      }

      if (id === "serviceType") {
        if (value !== "armed") {
          setInputs({ ...inputs, serviceType: value, longArm: false,
            profitMargin: inputs.isW9 ? W9_PROFIT_PERCENTAGES[value] : TARGET_PROFIT_PERCENTAGES[value] });
        } else {
          setInputs({ ...inputs, serviceType: value,
            profitMargin: inputs.isW9 ? W9_PROFIT_PERCENTAGES.armed : TARGET_PROFIT_PERCENTAGES.armed });
        }
        return;
      }

      if (id.startsWith("payRate_")) {
        const rateType = id.split("_")[1];
        setInputs({ ...inputs, payRates: { ...inputs.payRates, [rateType]: value === "" ? "" : parseFloat(value) } });
        return;
      }

      if (id === "profitMargin") {
        setInputs({ ...inputs, profitMargin: parseFloat(value) || TARGET_PROFIT_PERCENTAGES.unarmed });
        return;
      }

      if (id === "expenseFactor") {
        setInputs({ ...inputs, expenseFactor: value === "" ? "" : parseFloat(value) });
        return;
      }

      setInputs({ ...inputs, [id]: value === "" ? "" : parseFloat(value) });
    }

    React.useEffect(() => { calculate(); }, [inputs]);
    React.useEffect(() => {
      if (results.hourlyCharge > 0) {
        try { updateCharts(); } catch (err) { console.error("Chart update error:", err); }
      }
    }, [results, clientView]);

    function calculateVolumeDiscount(totalHours, enableDiscounts) {
      if (!enableDiscounts) return { discountRate: 0, discountApplied: false, hoursForDiscount: 0 };
      if (totalHours <= 100) return { discountRate: 0, discountApplied: false, hoursForDiscount: 140 - totalHours };
      const additionalHours = totalHours - 100;
      const additionalBlocks = Math.floor(additionalHours / 40);
      const discountBlocks = Math.min(additionalBlocks, 10);
      const discountPercentage = discountBlocks * 0.5;
      if (discountBlocks === 0) return { discountRate: 0, discountApplied: false, hoursForDiscount: 140 - totalHours };
      return { discountRate: discountPercentage / 100, discountApplied: true, hoursForDiscount: 0 };
    }

    function calculate() {
      if (inputs.hoursPerDay <= 0 || inputs.daysPerWeek <= 0 || inputs.guards <= 0) return;

      let basePayRate;
      if (inputs.serviceType === "unarmed") basePayRate = inputs.payRates.unarmed;
      else if (inputs.serviceType === "armed") basePayRate = inputs.longArm ? inputs.payRates.longArm : inputs.payRates.armed;
      else if (inputs.serviceType === "protection") basePayRate = inputs.payRates.protection;

      const totalWeeklyHours = inputs.hoursPerDay * inputs.daysPerWeek * inputs.guards;
      const travelTimeHours = (inputs.travelTime / 60) * inputs.daysPerWeek * inputs.guards;
      const laborRate = basePayRate * (1 + inputs.expenseFactor);
      const laborCost = laborRate * totalWeeklyHours;
      const travelCost = laborRate * travelTimeHours;
      const vehicleHoursPerWeek = inputs.vehicleNeeded ? inputs.hoursPerDay * inputs.daysPerWeek : 0;
      const vehicleCost = vehicleHoursPerWeek * VEHICLE_RATE;
      const totalCostBeforeProfit = laborCost + (inputs.vehicleNeeded ? vehicleCost : 0);
      const { discountRate, discountApplied, hoursForDiscount } = calculateVolumeDiscount(totalWeeklyHours, inputs.enableDiscounts);
      const targetProfitRate = inputs.profitMargin / 100;
      const profitAmount = (totalCostBeforeProfit * targetProfitRate) / (1 - targetProfitRate);
      const chargeBeforeDiscount = totalCostBeforeProfit + profitAmount;
      const discountAmount = chargeBeforeDiscount * discountRate;
      const totalCharge = chargeBeforeDiscount - discountAmount;
      const hourlyCharge = totalCharge / totalWeeklyHours;
      const profitPercentage = (profitAmount / chargeBeforeDiscount) * 100;
      const adjustedProfit = profitAmount - discountAmount;
      const adjustedProfitPercentage = (adjustedProfit / totalCharge) * 100;
      const weeklyRevenue = totalCharge + (inputs.chargeTravel ? travelCost : 0);

      setResults({
        hourlyCharge, totalCharge, mipCost: totalCostBeforeProfit, laborCost,
        vehicleCost, travelCost, profitAmount, profitPercentage,
        adjustedProfit, adjustedProfitPercentage,
        totalHours: totalWeeklyHours, travelHours: travelTimeHours,
        vehicleHours: vehicleHoursPerWeek, discount: discountRate,
        discountAmount, weeklyRevenue, discountApplied, hoursForDiscount
      });
    }

    function updateCharts() {
      if (costChartInstance.current) { costChartInstance.current.destroy(); costChartInstance.current = null; }
      if (breakdownChartInstance.current) { breakdownChartInstance.current.destroy(); breakdownChartInstance.current = null; }

      setTimeout(() => {
        try {
          const commonOptions = {
            responsive: true, maintainAspectRatio: false,
            plugins: {
              legend: { position: "bottom", labels: { padding: 20, boxWidth: 15, font: { size: 12, weight: "bold" }, color: "#ffffff" } },
              tooltip: { backgroundColor: "#1a365d", titleColor: "#ffffff", bodyColor: "#ffffff", borderColor: "#3a5e96", borderWidth: 1 }
            }
          };

          const costDataItems = [{ label: "Labor Cost", value: results.laborCost, color: "rgba(185, 10, 13, 0.7)", border: "rgba(185, 10, 13, 1)" }];
          if (results.vehicleCost > 0) costDataItems.push({ label: "Vehicle Cost", value: results.vehicleCost, color: "rgba(52, 152, 219, 0.7)", border: "rgba(52, 152, 219, 1)" });
          if (inputs.chargeTravel && results.travelCost > 0) costDataItems.push({ label: "Travel Cost", value: results.travelCost, color: "rgba(155, 89, 182, 0.7)", border: "rgba(155, 89, 182, 1)" });
          if (!clientView) {
            costDataItems.push({
              label: inputs.enableDiscounts && results.discountApplied ? "Profit (After Discount)" : "Profit",
              value: inputs.enableDiscounts && results.discountApplied ? results.adjustedProfit : results.profitAmount,
              color: "rgba(35, 174, 56, 0.7)", border: "rgba(35, 174, 56, 1)"
            });
          }

          const chartOptions = { ...commonOptions, plugins: { ...commonOptions.plugins,
            tooltip: { ...commonOptions.plugins.tooltip, callbacks: { label: function(context) { return `${context.label || ""}: $${context.raw.toFixed(2)}`; } } } } };

          let serviceLabel = "";
          if (inputs.serviceType === "unarmed") serviceLabel = "Unarmed Security";
          else if (inputs.serviceType === "armed") serviceLabel = inputs.longArm ? "Armed Security with Long Arm" : "Armed Security";
          else if (inputs.serviceType === "protection") serviceLabel = "Executive Protection";

          const serviceCost = clientView ? results.laborCost + results.profitAmount : results.laborCost;
          const serviceLabels = [serviceLabel];
          const serviceData = [serviceCost];
          const serviceColors = ["rgba(185, 10, 13, 0.7)"];
          const serviceBorders = ["rgba(185, 10, 13, 1)"];

          if (inputs.chargeTravel && results.travelCost > 0) {
            serviceLabels.push("Travel Time"); serviceData.push(results.travelCost);
            serviceColors.push("rgba(155, 89, 182, 0.7)"); serviceBorders.push("rgba(155, 89, 182, 1)");
          }
          if (inputs.vehicleNeeded) {
            serviceLabels.push("Security Vehicle");
            serviceData.push(clientView ? results.vehicleCost + results.profitAmount * (results.vehicleCost / results.mipCost) : results.vehicleCost);
            serviceColors.push("rgba(52, 152, 219, 0.7)"); serviceBorders.push("rgba(52, 152, 219, 1)");
          }

          if (costChartRef.current) {
            costChartInstance.current = new Chart(costChartRef.current, { type: "pie",
              data: { labels: costDataItems.map(i => i.label), datasets: [{ data: costDataItems.map(i => i.value), backgroundColor: costDataItems.map(i => i.color), borderColor: costDataItems.map(i => i.border), borderWidth: 1 }] },
              options: chartOptions });
          }
          if (breakdownChartRef.current) {
            breakdownChartInstance.current = new Chart(breakdownChartRef.current, { type: "pie",
              data: { labels: serviceLabels, datasets: [{ data: serviceData, backgroundColor: serviceColors, borderColor: serviceBorders, borderWidth: 1 }] },
              options: chartOptions });
          }
        } catch (err) { console.error("Error creating charts:", err); }
      }, 50);
    }

    const getProfitWarningClass = () => {
      if (inputs.profitMargin >= TARGET_PROFIT_PERCENTAGES.unarmed) return "profit-good";
      else if (inputs.profitMargin >= WARNING_PROFIT_PERCENTAGE) return "profit-warning";
      else return "profit-danger";
    };

    const getSliderColorClass = () => {
      if (inputs.profitMargin >= 30) return "slider-blue";
      else if (inputs.profitMargin >= TARGET_PROFIT_PERCENTAGES.unarmed) return "slider-good";
      else if (inputs.profitMargin >= WARNING_PROFIT_PERCENTAGE) return "slider-warning";
      else return "slider-danger";
    };

    const getServiceTypeName = () => {
      if (inputs.serviceType === "unarmed") return "Unarmed Security";
      else if (inputs.serviceType === "armed") return inputs.longArm ? "Armed Security with Long Arm" : "Armed Security";
      else if (inputs.serviceType === "protection") return "Executive Protection";
      else return "Security Service";
    };

    const getRecommendedProfitMargin = () => {
      if (inputs.isW9) {
        if (inputs.serviceType === "armed" && inputs.longArm) return W9_PROFIT_PERCENTAGES.longArm;
        return W9_PROFIT_PERCENTAGES[inputs.serviceType];
      }
      if (inputs.serviceType === "armed" && inputs.longArm) return TARGET_PROFIT_PERCENTAGES.longArm;
      return TARGET_PROFIT_PERCENTAGES[inputs.serviceType];
    };

    return (
      <div>
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Security Services Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Input Parameters</h2>

            <div className="mb-4">
              <label htmlFor="serviceType" className="block font-medium mb-1">Security Service Type:</label>
              <select id="serviceType" value={inputs.serviceType} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-lg">
                <option value="unarmed">Unarmed Security</option>
                <option value="armed">Armed Security</option>
                <option value="protection">Executive Protection</option>
              </select>
            </div>

            {inputs.serviceType === "armed" && (
              <div className="mb-4 pl-4 border-l-4 border-amber-500">
                <div className="flex items-center">
                  <input type="checkbox" id="longArm" checked={inputs.longArm} onChange={handleChange} className="h-5 w-5 text-blue-600" />
                  <label htmlFor="longArm" className="ml-2 block font-medium">Include Long Arm</label>
                </div>
              </div>
            )}

            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label htmlFor="isW9" className="flex items-center cursor-pointer">
                <div className="relative">
                  <input type="checkbox" id="isW9" className="sr-only" checked={inputs.isW9} onChange={handleChange} />
                  <div className={`block w-10 h-6 rounded-full transition ${inputs.isW9 ? "bg-green-500" : "bg-gray-600"}`}></div>
                  <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${inputs.isW9 ? "translate-x-4" : ""}`}></div>
                </div>
                <div className="ml-3 font-medium text-gray-700">{inputs.isW9 ? "W-9 Contractors" : "Internal Guards"}</div>
              </label>
              <div className="text-xs text-gray-500 mt-2">
                {inputs.isW9 ? "W-9 contractors pay their own taxes and have higher pay rates but lower operational expenses (27%)" : "Internal guards have standard pay rates with standard operational expenses (73%)"}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="payRate" className="block font-medium mb-1">Guard Pay Rate ($/hr):</label>
              <input type="number" id="payRate"
                value={(() => {
                  const v = inputs.serviceType === "unarmed" ? inputs.payRates.unarmed
                    : inputs.serviceType === "armed" ? (inputs.longArm ? inputs.payRates.longArm : inputs.payRates.armed)
                    : inputs.payRates.protection;
                  return v === 0 ? "" : v;
                })()}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  const newPayRates = { ...inputs.payRates };
                  if (inputs.serviceType === "unarmed") newPayRates.unarmed = value;
                  else if (inputs.serviceType === "armed") { if (inputs.longArm) newPayRates.longArm = value; else newPayRates.armed = value; }
                  else if (inputs.serviceType === "protection") newPayRates.protection = value;
                  setInputs({ ...inputs, payRates: newPayRates });
                }}
                onFocus={(e) => e.target.select()}
                className="w-full p-2 border border-gray-300 rounded text-lg" min="0" step="0.50" />
              <div className="text-xs text-gray-500 mt-1">Base pay rate for the security officer {inputs.isW9 ? "(W-9 contractor)" : ""}</div>
            </div>

            <div className="mb-4">
              <label htmlFor="guards" className="block font-medium mb-1">Number of Security Officers:</label>
              <input type="number" id="guards" value={inputs.guards} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-lg" min="1" step="1" />
            </div>

            <div className="mb-4">
              <label htmlFor="hoursPerDay" className="block font-medium mb-1">Hours Per Day:</label>
              <input type="number" id="hoursPerDay" value={inputs.hoursPerDay} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-lg" min="1" max="24" step="0.5" />
            </div>

            <div className="mb-4">
              <label htmlFor="daysPerWeek" className="block font-medium mb-1">Shifts Per Week:</label>
              <input type="number" id="daysPerWeek" value={inputs.daysPerWeek} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-lg" min="1" max="7" step="1" />
            </div>

            {!clientView && (
              <div className="mb-6 bg-blue-800 bg-opacity-30 p-4 rounded-lg">
                <label htmlFor="profitMargin" className="block font-medium mb-1">
                  Target Profit Margin:{" "}
                  <span className={getProfitWarningClass()}>{inputs.profitMargin.toFixed(1)}%</span>
                  <span className="text-xs ml-2">(Recommended: {getRecommendedProfitMargin()}%)</span>
                </label>
                <input type="range" id="profitMargin" value={inputs.profitMargin} onChange={handleChange}
                  className={`slider w-full ${getSliderColorClass()}`} min="5" max="50" step="0.5" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span className="text-red-500">5%</span>
                  <span className="text-yellow-500">10%</span>
                  <span className="text-green-400">15%</span>
                  <span className="text-green-400">20%</span>
                  <span className="text-green-400">25%</span>
                  <span className="text-blue-400">30%</span>
                  <span className="text-blue-400">35%</span>
                  <span className="text-blue-400">40%</span>
                  <span className="text-blue-400">45%</span>
                  <span className="text-blue-400">50%</span>
                </div>
                <c1>Profit in <y1>Yellow needs Financial Approval</y1></c1>
                <div></div>
                <c1>Profit in <r1>Red Requires CEO Approval</r1></c1>
              </div>
            )}

            {!clientView && (
              <div className="mb-4">
                <label htmlFor="expenseFactor" className="block font-medium mb-1">Expense Factor:</label>
                <input type="number" id="expenseFactor" value={inputs.expenseFactor} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-lg" min="0" max="1" step="0.01" />
                <div className="text-xs text-gray-500 mt-1">
                  {inputs.isW9 ? "Operating expense ratio for W-9 contractors (default: 27%)" : "Factor to account for overhead (default: 73% overhead)"}
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input type="checkbox" id="chargeTravel" checked={inputs.chargeTravel} onChange={handleChange} className="h-5 w-5 text-blue-600" />
                <label htmlFor="chargeTravel" className="ml-2 block font-medium">Charge for Travel Time</label>
              </div>
              {inputs.chargeTravel && (
                <div className="pl-7 mt-2">
                  <label htmlFor="travelTime" className="block font-medium mb-1">Daily Travel Time (minutes):</label>
                  <input type="number" id="travelTime" value={inputs.travelTime} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-lg" min="0" step="5" />
                  <div className="text-xs text-gray-500 mt-1">Average daily commute/travel time for security personnel</div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input type="checkbox" id="vehicleNeeded" checked={inputs.vehicleNeeded} onChange={handleChange} className="h-5 w-5 text-blue-600" />
                <label htmlFor="vehicleNeeded" className="ml-2 block font-medium">Include Security Vehicle (${VEHICLE_RATE.toFixed(2)}/hr)</label>
              </div>
              <div className="text-xs text-gray-500 pl-7">Flat rate added per service hour</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm mt-4">
              <h3 className="font-semibold text-gray-700 mb-1">Tips</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Unarmed security is optimal for monitoring and observation</li>
                <li>Armed security provides deterrence and response capabilities</li>
                <li>Executive protection includes close personal security</li>
                <li>Volume discounts apply for schedules over 100 total hours/week across all officers (0.5% per additional 40 hours after 100)</li>
                {inputs.isW9 && <li>W-9 contractors have higher pay rates but lower operational costs</li>}
              </ul>
              <div className="mt-4 pt-2 border-t border-blue-300">
                <label htmlFor="enableDiscounts" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" id="enableDiscounts" className="sr-only" checked={inputs.enableDiscounts} onChange={handleChange} />
                    <div className={`block w-10 h-6 rounded-full transition ${inputs.enableDiscounts ? "bg-green-500" : "bg-gray-600"}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${inputs.enableDiscounts ? "translate-x-4" : ""}`}></div>
                  </div>
                  <div className="ml-3 font-medium text-gray-700">{inputs.enableDiscounts ? "Volume Discounts Enabled" : "Volume Discounts Disabled"}</div>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2 text-center">Recommended Pricing</h2>
              <div className="text-4xl font-bold text-center mb-2">${results.hourlyCharge.toFixed(2)} <span className="text-base">per hour</span></div>
              <div className="text-center text-blue-100">
                ${results.weeklyRevenue.toFixed(2)} total per week
                {results.discountApplied && <span className="ml-2 text-green-300">(includes {(results.discount * 100).toFixed(1)}% volume discount)</span>}
              </div>
              <div className="text-center text-blue-100">
                ${(results.weeklyRevenue * 4.33).toFixed(2)} total per month
                {results.discountApplied && <span className="ml-2 text-green-300">(includes {(results.discount * 100).toFixed(1)}% volume discount)</span>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white bg-opacity-20 p-2 rounded"><div className="text-sm text-blue-100">Service Type</div><div className="text-lg font-semibold">{getServiceTypeName()}</div></div>
                <div className="bg-white bg-opacity-20 p-2 rounded"><div className="text-sm text-blue-100">Officers</div><div className="text-lg font-semibold">{inputs.guards}</div></div>
                <div className="bg-white bg-opacity-20 p-2 rounded"><div className="text-sm text-blue-100">Hours/Week</div><div className="text-lg font-semibold">{results.totalHours}</div></div>
                <div className="bg-white bg-opacity-20 p-2 rounded"><div className="text-sm text-blue-100">Vehicle</div><div className="text-lg font-semibold">{inputs.vehicleNeeded ? "Yes" : "No"}</div></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Cost Breakdown</h3>
                <div className="h-60 mb-6"><canvas ref={costChartRef} className="cost-chart"></canvas></div>
                <div className="space-y-2">
                  {!clientView ? (
                    <div className="flex justify-between mb-1"><span>MIP's total cost:</span><span className="font-medium">${results.mipCost.toFixed(2)}</span></div>
                  ) : (
                    <div className="flex justify-between mb-1"><span>Total cost:</span><span className="font-medium">${results.totalCharge.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between mb-1 text-sm text-gray-600"><span>Labor cost:</span><span>${results.laborCost.toFixed(2)}</span></div>
                  {inputs.vehicleNeeded && <div className="flex justify-between mb-1 text-sm text-gray-600"><span>Vehicle cost:</span><span>${results.vehicleCost.toFixed(2)}</span></div>}
                  {results.travelHours > 0 && <div className="flex justify-between mb-1 text-sm text-gray-600"><span>Travel cost {!inputs.chargeTravel && "(not charged)"}:</span><span>${results.travelCost.toFixed(2)}</span></div>}
                  {!clientView && (
                    <div className="flex justify-between mb-1 text-sm profit-info">
                      <span>Profit ({inputs.profitMargin.toFixed(1)}%):</span>
                      <span className={getProfitWarningClass()}>${results.profitAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {inputs.enableDiscounts && (
                    <div className="flex justify-between mb-1 text-sm text-green-600">
                      {results.discountApplied ? (
                        <><span>Volume discount ({(results.discount * 100).toFixed(1)}%):</span><span>-${results.discountAmount.toFixed(2)}</span></>
                      ) : (
                        <><span>Volume discount:</span><span>{results.hoursForDiscount > 0 ? `${results.hoursForDiscount.toFixed(0)} more hours needed` : "Not applied"}</span></>
                      )}
                    </div>
                  )}
                  {!clientView && inputs.enableDiscounts && results.discountApplied && (
                    <div className="flex justify-between mb-1 text-sm border-t border-blue-700 mt-2 pt-2 font-medium profit-info">
                      <span>Adjusted profit after discount:</span>
                      <span className={results.adjustedProfitPercentage >= WARNING_PROFIT_PERCENTAGE ? "profit-good" : "profit-warning"}>
                        ${results.adjustedProfit.toFixed(2)} ({results.adjustedProfitPercentage.toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Service Breakdown</h3>
                <div className="h-60 mb-6"><canvas ref={breakdownChartRef} className="breakdown-chart"></canvas></div>
                <div className="space-y-2">
                  <div className="flex justify-between mb-1"><span>Total weekly revenue:</span><span className="font-medium">${results.weeklyRevenue.toFixed(2)}</span></div>
                  <div className="flex justify-between mb-1 text-sm text-gray-600">
                    <span>{getServiceTypeName()}:</span>
                    <span>${results.laborCost.toFixed(2)} {!clientView && <span className="profit-info">+ profit</span>}</span>
                  </div>
                  {results.travelHours > 0 && <div className="flex justify-between mb-1 text-sm text-gray-600"><span>Travel Time:</span><span>${results.travelCost.toFixed(2)}{!inputs.chargeTravel && " (not charged)"}</span></div>}
                  {inputs.vehicleNeeded && <div className="flex justify-between mb-1 text-sm text-gray-600"><span>Security Vehicle:</span><span>${results.vehicleCost.toFixed(2)} {!clientView && <span className="profit-info">+ profit</span>}</span></div>}
                  <div className="flex justify-between mb-1 text-sm text-gray-500"><span>Hourly rate:</span><span>${results.hourlyCharge.toFixed(2)}/hour</span></div>
                  {inputs.daysPerWeek < 7 && <div className="mt-2 text-xs text-blue-600">Add weekend coverage for comprehensive protection</div>}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Advanced Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Base Pay Rate</div>
                  <div className="text-lg font-semibold">
                    ${inputs.serviceType === "unarmed" ? inputs.payRates.unarmed.toFixed(2)
                      : inputs.serviceType === "armed" ? (inputs.longArm ? inputs.payRates.longArm.toFixed(2) : inputs.payRates.armed.toFixed(2))
                      : inputs.payRates.protection.toFixed(2)}/hr
                  </div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Target Bill Rate</div>
                  <div className="text-lg font-semibold">
                    ${inputs.serviceType === "unarmed" ? TARGET_BILL_RATES.unarmed.toFixed(2)
                      : inputs.serviceType === "armed" ? (inputs.longArm ? TARGET_BILL_RATES.longArm.toFixed(2) : TARGET_BILL_RATES.armed.toFixed(2))
                      : TARGET_BILL_RATES.protection.toFixed(2)}/hr
                  </div>
                </div>
                <div className="bg-white p-3 rounded shadow-sm"><div className="text-xs text-gray-500">Monthly Revenue</div><div className="text-lg font-semibold">${(results.weeklyRevenue * 4.33).toFixed(2)}</div></div>
                <div className="bg-white p-3 rounded shadow-sm"><div className="text-xs text-gray-500">Annual Revenue</div><div className="text-lg font-semibold">${(results.weeklyRevenue * 52).toFixed(2)}</div></div>
              </div>
              <div className="mt-4 text-xs text-gray-500 italic">
                Note: Expense factor accounts for all overhead costs including training, equipment, insurance, and administrative expenses.
                {inputs.isW9 && " W-9 contractors have reduced overhead due to self-employment."}
                {inputs.vehicleNeeded && " Vehicle costs are calculated as a flat rate per service hour."}
                {results.travelHours > 0 && " Travel time is calculated separately."}
                {inputs.enableDiscounts && results.discountApplied && ` Volume discount of ${(results.discount * 100).toFixed(1)}% applied.`}
              </div>
            </div>

            {inputs.isW9 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-green-800">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">W-9 Contractor Rates Applied</span>
                </div>
                <div className="text-xs mt-1 ml-7">Calculations using W-9 contractor rates with modified expense factor</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  //===================================================
  // PATROL CALCULATOR COMPONENT
  //===================================================
  function MIPPatrolCalculator({ clientView }) {
    const WARNING_PROFIT_PERCENTAGE = 20.0;

    const calculateDiscount = (numStops, enableDiscounts) => {
      if (!enableDiscounts || numStops <= 3) return 0;
      const extraStops = Math.min(numStops - 3, 10);
      return extraStops / 100;
    };

    const [inputs, setInputs] = React.useState({
      numStops: 3, guardRate: 23, expenseFactor: 0.80,
      travelTime: 12, timeToNextStop: 5, minutesPerStop: 15,
      enableDiscounts: false,
      profitMargin: 30.0
    });

    const [results, setResults] = React.useState({
      chargePerStop: 0, mipCost: 0, laborCost: 0, extraTimeCost: 0,
      profitAmount: 0, totalTime: 0, travelTime: 0, stopTime: 0,
      extraStopTime: 0, betweenStopsTime: 0, discount: 0, totalRevenue: 0
    });

    const costChartRef = React.useRef(null);
    const timeChartRef = React.useRef(null);
    const costChart = React.useRef(null);
    const timeChart = React.useRef(null);

    function handleChange(e) {
      const { id, value, type, checked } = e.target;
      if (type === "checkbox") { setInputs({ ...inputs, [id]: checked }); return; }
      if (id === "profitMargin") { setInputs({ ...inputs, profitMargin: parseFloat(value) }); return; }
      setInputs({ ...inputs, [id]: value === "" ? "" : parseFloat(value) });
    }

    React.useEffect(() => { calculate(); }, [inputs]);
    React.useEffect(() => {
      if (results.chargePerStop > 0) {
        try { updateCharts(); } catch (err) { console.error("Chart update error:", err); }
      }
    }, [results, clientView]);

    function calculate() {
      if (inputs.numStops <= 0) return;
      const travelToFirstStopHours = inputs.travelTime / 60;
      const timeToNextStopHours = inputs.timeToNextStop / 60;
      const returnTravelHours = inputs.travelTime / 60;
      const driveTimeBetweenStops = inputs.numStops > 1 ? (inputs.numStops - 1) * timeToNextStopHours : 0;
      const baseMinutes = Math.min(inputs.minutesPerStop, 15);
      const baseTime = (inputs.numStops * baseMinutes) / 60;
      const extraMinutes = Math.max(0, inputs.minutesPerStop - 15);
      const extraTime = (inputs.numStops * extraMinutes) / 60;
      const totalTravelTime = travelToFirstStopHours + driveTimeBetweenStops + returnTravelHours;
      const totalTime = totalTravelTime + baseTime + extraTime;
      const laborRate = inputs.guardRate * (1 + inputs.expenseFactor);
      const laborCost = laborRate * (totalTravelTime + baseTime - (driveTimeBetweenStops * 0.20));
      const extraTimeCost = laborRate * 1.3 * extraTime;
      const totalCostBeforeProfit = laborCost + extraTimeCost;
      const discount = calculateDiscount(inputs.numStops, inputs.enableDiscounts);
      const targetProfitRate = inputs.profitMargin / 100;
      const profitAmount = (totalCostBeforeProfit * targetProfitRate) / (1 - targetProfitRate);
      const totalCharge = (totalCostBeforeProfit + profitAmount) * (1 - discount);
      const chargePerStop = totalCharge / inputs.numStops;
      const mipCost = totalCostBeforeProfit / inputs.numStops;

      setResults({
        chargePerStop, mipCost, laborCost, extraTimeCost, profitAmount,
        totalTime: totalTime * 60,
        travelTime: (travelToFirstStopHours + returnTravelHours) * 60,
        betweenStopsTime: driveTimeBetweenStops * 60,
        stopTime: baseTime * 60, extraStopTime: extraTime * 60,
        discount, totalRevenue: totalCharge
      });
    }

    function updateCharts() {
      if (costChart.current) { costChart.current.destroy(); costChart.current = null; }
      if (timeChart.current) { timeChart.current.destroy(); timeChart.current = null; }

      const commonOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { position: "bottom", labels: { padding: 20, boxWidth: 15, font: { size: 12, weight: "bold" }, color: "#ffffff" } },
          tooltip: { backgroundColor: "#1a365d", titleColor: "#ffffff", bodyColor: "#ffffff", borderColor: "#3a5e96", borderWidth: 1 }
        }
      };

      const costDataItems = [{ label: "Labor Cost", value: results.laborCost, color: "rgba(185, 10, 13, 0.7)", border: "rgba(185, 10, 13, 1)" }];
      if (results.extraTimeCost > 0) costDataItems.push({ label: "Extra Time Cost", value: results.extraTimeCost, color: "rgba(243, 156, 18, 0.7)", border: "rgba(243, 156, 18, 1)" });
      if (!clientView) costDataItems.push({ label: "Profit", value: results.profitAmount, color: "rgba(35, 174, 56, 0.7)", border: "rgba(35, 174, 56, 1)" });

      const costChartOptions = { ...commonOptions, plugins: { ...commonOptions.plugins,
        tooltip: { ...commonOptions.plugins.tooltip, callbacks: { label: function(context) { return `${context.label || ""}: $${context.raw.toFixed(2)}`; } } } } };
      const timeChartOptions = { ...commonOptions, plugins: { ...commonOptions.plugins,
        tooltip: { ...commonOptions.plugins.tooltip, callbacks: { label: function(context) { return `${context.label || ""}: ${context.raw.toFixed(0)} minutes`; } } } } };

      if (costChartRef.current) {
        costChart.current = new Chart(costChartRef.current, { type: "pie",
          data: { labels: costDataItems.map(i => i.label), datasets: [{ data: costDataItems.map(i => i.value), backgroundColor: costDataItems.map(i => i.color), borderColor: costDataItems.map(i => i.border), borderWidth: 1 }] },
          options: costChartOptions });
      }
      if (timeChartRef.current) {
        timeChart.current = new Chart(timeChartRef.current, { type: "pie",
          data: { labels: ["Travel to/from", "Between Stops", "At Stops (standard)", "Extra Stop Time"],
            datasets: [{ data: [results.travelTime, results.betweenStopsTime, results.stopTime, results.extraStopTime],
              backgroundColor: ["rgba(52, 152, 219, 0.7)", "rgba(235, 14, 18, 0.7)", "rgba(235, 147, 14, 0.7)", "rgba(61, 176, 60, 0.7)"],
              borderColor: ["rgba(52, 152, 219, 1)", "rgba(235, 14, 18, 1)", "rgba(235, 147, 14, 1)", "rgba(61, 176, 60, 1)"], borderWidth: 1 }] },
          options: timeChartOptions });
      }
    }

    const getProfitWarningClass = () => {
      if (inputs.profitMargin >= 50) return "profit-blue";
      else if (inputs.profitMargin >= 30) return "profit-good";
      else if (inputs.profitMargin >= WARNING_PROFIT_PERCENTAGE) return "profit-warning";
      else return "profit-danger";
    };

    const getSliderColorClass = () => {
      if (inputs.profitMargin >= 50) return "slider-blue";
      else if (inputs.profitMargin >= 30) return "slider-good";
      else if (inputs.profitMargin >= WARNING_PROFIT_PERCENTAGE) return "slider-warning";
      else return "slider-danger";
    };

    const profitPercentOfTotal = results.profitAmount > 0
      ? (results.profitAmount / (results.laborCost + results.extraTimeCost + results.profitAmount)) * 100 : 0;

    return (
      <div>
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Patrol Stop Calculator</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Input Parameters</h2>

            <div className="mb-4">
              <label htmlFor="numStops" className="block font-medium mb-1">Number of Stops Per Night:</label>
              <input type="number" id="numStops" value={inputs.numStops} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-lg" min="1" step="1" />
            </div>

            <div className="mb-4">
              <label htmlFor="guardRate" className="block font-medium mb-1">Guard Hourly Rate ($):</label>
              <input type="number" id="guardRate" value={inputs.guardRate} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-lg" min="10" step="0.5" />
            </div>

            {!clientView && (
              <div className="mb-4">
                <label htmlFor="expenseFactor" className="block font-medium mb-1">Expense Factor:</label>
                <input type="number" id="expenseFactor" value={inputs.expenseFactor} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-lg" min="0" max="1" step="0.01" />
                <div className="text-xs text-gray-500 mt-1">Factor to account for overhead (0.73 = 73% overhead)</div>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="travelTime" className="block font-medium mb-1">Travel Time (minutes to first/from last stop):</label>
              <input type="number" id="travelTime" value={inputs.travelTime} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-lg" min="0" step="1" />
            </div>

            <div className="mb-4">
              <label htmlFor="timeToNextStop" className="block font-medium mb-1">Avg Drive Time Between Site Stops (min):</label>
              <input type="number" id="timeToNextStop" value={inputs.timeToNextStop} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-lg" min="0" step="1" />
              <div className="text-xs text-gray-500 mt-1">Average drive time between consecutive patrol locations</div>
            </div>

            <div className="mb-4">
              <label htmlFor="minutesPerStop" className="block font-medium mb-1">Minutes Per Stop:</label>
              <input type="number" id="minutesPerStop" value={inputs.minutesPerStop} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded text-lg" min="1" step="1" />
              <div className="text-xs text-gray-500 mt-1">Standard stop is 10-15 minutes (extra time billed at premium rate)</div>
            </div>

            {!clientView && (
              <div className="mb-6 bg-blue-800 bg-opacity-30 p-4 rounded-lg">
                <label htmlFor="profitMargin" className="block font-medium mb-1">
                  Target Profit Margin:{" "}
                  <span className={getProfitWarningClass()}>{inputs.profitMargin.toFixed(1)}%</span>
                </label>
                <input type="range" id="profitMargin" value={inputs.profitMargin} onChange={handleChange}
                  className={`slider w-full ${getSliderColorClass()}`} min="5" max="60" step="0.5" />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span className="text-red-500">5%</span>
                  <span className="text-red-400">10%</span>
                  <span className="text-red-400">15%</span>
                  <span className="text-yellow-400">20%</span>
                  <span className="text-yellow-400">25%</span>
                  <span className="text-green-400">30%</span>
                  <span className="text-green-400">40%</span>
                  <span className="text-blue-400">50%</span>
                  <span className="text-blue-400">55%</span>
                  <span className="text-blue-400">60%</span>
                </div>
                <c1>Profit in <y1>Yellow needs Financial Approval</y1></c1>
                <div></div>
                <c1>Profit in <r1>Red Requires CEO Approval</r1></c1>
              </div>
            )}

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm mt-4">
              <h3 className="font-semibold text-gray-700 mb-1">Tips</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Standard patrol stops are 10-15 minutes</li>
                <li>Longer stops incur premium charges</li>
                <li>Volume discounts apply for routes with &gt;3 stops</li>
                {!clientView && <li>Profit is set to ~30% of total revenue by default</li>}
              </ul>
              <div className="mt-4 pt-2 border-t border-blue-300">
                <label htmlFor="enableDiscounts" className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" id="enableDiscounts" className="sr-only" checked={inputs.enableDiscounts} onChange={handleChange} />
                    <div className={`block w-10 h-6 rounded-full transition ${inputs.enableDiscounts ? "bg-green-500" : "bg-gray-600"}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${inputs.enableDiscounts ? "translate-x-4" : ""}`}></div>
                  </div>
                  <div className="ml-3 font-medium text-gray-700">{inputs.enableDiscounts ? "Volume Discounts Enabled" : "Volume Discounts Disabled"}</div>
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2 text-center">Recommended Pricing</h2>
              <div className="text-4xl font-bold text-center mb-2">${results.chargePerStop.toFixed(2)} <span className="text-base">per stop</span></div>
              <div className="text-center text-blue-100">${results.totalRevenue.toFixed(2)} total for {inputs.numStops} stops</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white bg-opacity-20 p-2 rounded"><div className="text-sm text-blue-100">Total Stops</div><div className="text-xl font-semibold">{inputs.numStops}</div></div>
                <div className="bg-white bg-opacity-20 p-2 rounded"><div className="text-sm text-blue-100">Minutes/Stop</div><div className="text-xl font-semibold">{inputs.minutesPerStop}</div></div>
                <div className="bg-white bg-opacity-20 p-2 rounded"><div className="text-sm text-blue-100">Total Time/Shift</div><div className="text-xl font-semibold">{Math.round(results.totalTime)} min</div></div>
                <div className="bg-white bg-opacity-20 p-2 rounded"><div className="text-sm text-blue-100">Time Per Month</div><div className="text-xl font-semibold">{(Math.round(results.totalTime) * 7 * 4.33).toFixed(2)}</div></div>
                <div className="bg-white bg-opacity-20 p-2 rounded"><div className="text-sm text-blue-100">Monthly Client Bill Average</div><div className="text-xl font-semibold">${(results.totalRevenue * 7 * 4.33).toFixed(2)}</div></div>
                <div className="bg-white bg-opacity-20 p-2 rounded"><div className="text-sm text-blue-100">Hourly Rate</div><div className="text-xl font-semibold">${((results.totalRevenue / results.totalTime) * 60).toFixed(2)}</div></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Cost Breakdown</h3>
                <div className="h-60 mb-6"><canvas ref={costChartRef} className="cost-chart"></canvas></div>
                <div className="space-y-2">
                  {!clientView ? (
                    <div className="flex justify-between mb-1"><span>MIP's cost per stop:</span><span className="font-medium">${results.mipCost.toFixed(2)}</span></div>
                  ) : (
                    <div className="flex justify-between mb-1"><span>Cost per stop:</span><span className="font-medium">${results.chargePerStop.toFixed(2)}</span></div>
                  )}
                  <div className="flex justify-between mb-1 text-sm text-gray-600"><span>Labor cost:</span><span>${results.laborCost.toFixed(2)} total</span></div>
                  {results.extraTimeCost > 0 && <div className="flex justify-between mb-1 text-sm text-gray-600"><span>Extra time premium:</span><span>${results.extraTimeCost.toFixed(2)} total</span></div>}
                  {!clientView && (
                    <div className="flex justify-between mb-1 text-sm text-gray-600">
                      <span>Profit:</span>
                      <span className={getProfitWarningClass()}>${results.profitAmount.toFixed(2)} ({profitPercentOfTotal.toFixed(1)}%)</span>
                    </div>
                  )}
                  {inputs.numStops > 3 && inputs.enableDiscounts && (
                    <div className="flex justify-between mb-1 text-sm text-green-600">
                      <span>Volume discount:</span>
                      <span>-${(results.discount * (results.laborCost + results.extraTimeCost + results.profitAmount)).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">Time Allocation</h3>
                <div className="h-60 mb-6"><canvas ref={timeChartRef} className="time-chart"></canvas></div>
                <div className="space-y-2">
                  <div className="flex justify-between mb-1"><span>Total patrol time:</span><span className="font-medium">{Math.round(results.totalTime)} minutes</span></div>
                  <div className="flex justify-between mb-1 text-sm text-gray-600"><span>Travel time (to/from):</span><span>{Math.round(results.travelTime)} minutes</span></div>
                  {inputs.numStops > 1 && <div className="flex justify-between mb-1 text-sm text-gray-600"><span>Between stops:</span><span>{Math.round(results.betweenStopsTime)} minutes</span></div>}
                  <div className="flex justify-between mb-1 text-sm text-gray-600"><span>Time at stops (standard):</span><span>{Math.round(results.stopTime)} minutes</span></div>
                  {results.extraStopTime > 0 && <div className="flex justify-between mb-1 text-sm text-orange-600"><span>Extra time (premium):</span><span>{Math.round(results.extraStopTime)} minutes</span></div>}
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">Advanced Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded shadow-sm"><div className="text-xs text-gray-500">Labor Rate</div><div className="text-lg font-semibold">${(inputs.guardRate * (1 + inputs.expenseFactor)).toFixed(2)}/hr</div></div>
                <div className="bg-white p-3 rounded shadow-sm"><div className="text-xs text-gray-500">Premium Rate</div><div className="text-lg font-semibold">${(inputs.guardRate * (1 + inputs.expenseFactor) * 1.3).toFixed(2)}/hr</div></div>
                <div className="bg-white p-3 rounded shadow-sm"><div className="text-xs text-gray-500">Cost Per Minute</div><div className="text-lg font-semibold">${(results.mipCost / inputs.minutesPerStop).toFixed(2)}</div></div>
                <div className="bg-white p-3 rounded shadow-sm"><div className="text-xs text-gray-500">Revenue Per Hour</div><div className="text-lg font-semibold">${((results.totalRevenue / results.totalTime) * 60).toFixed(2)}</div></div>
              </div>
              <div className="mt-4 text-xs text-gray-500 italic">
                Note: Expense factor accounts for all overhead costs including vehicle, fuel, insurance, and administrative expenses.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  ReactDOM.render(<MIPCalculatorApp />, document.getElementById("root"));
}
