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
  // Set Chart.js global defaults for dark theme
  Chart.defaults.color = "#ffffff";
  Chart.defaults.borderColor = "rgba(255, 255, 255, 0.1)";
  Chart.defaults.plugins.legend.labels.color = "#ffffff";
  Chart.defaults.plugins.tooltip.backgroundColor = "#1a365d";
  Chart.defaults.plugins.tooltip.titleColor = "#ffffff";
  Chart.defaults.plugins.tooltip.bodyColor = "#ffffff";

  // Main App Container Component
  function MIPCalculatorApp() {
    // State for toggle switches
    const [calculatorType, setCalculatorType] = React.useState("guard"); // 'guard' or 'patrol'
    const [clientView, setClientView] = React.useState(false); // false = show profit, true = hide profit

    // Handle calculator toggle
    const toggleCalculator = () => {
      setCalculatorType((prevType) =>
        prevType === "guard" ? "patrol" : "guard"
      );
    };

    // Handle client view toggle
    const toggleClientView = () => {
      setClientView((prevView) => !prevView);
    };

    return (
      <div className="p-6 max-w-6xl mx-auto rounded-lg shadow-md mt-4 mb-8 transition-all duration-300">
{/* Header with title and toggles */}
<div className="header-container">
  <img src="https://lofthaus.s3.amazonaws.com/images/780527/4.png" alt="MIP Security Services Logo" className="header-logo" />
  <h1 className="header-title" href="">
    MIP Security Services
  </h1>
  <div className="toggle-row">
    <div className="left-toggle">
      {/* Calculator Type Toggle */}
      <div className="flex items-center border-2 border-solid rounded-md p-2 header-toggle">
        <label
          htmlFor="calculatorToggle"
          className="flex items-center cursor-pointer"
        >
          <div className="relative">
            <input
              type="checkbox"
              id="calculatorToggle"
              className="sr-only"
              checked={calculatorType === "patrol"}
              onChange={toggleCalculator}
            />
            <div
              className={`block w-10 h-6 rounded-full transition ${
                calculatorType === "patrol"
                  ? "bg-yellow-500"
                  : "bg-green-600"
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${
                calculatorType === "patrol" ? "translate-x-4" : ""
              }`}
            ></div>
          </div>
          <div className="ml-3 font-medium text-gray-700">
            {calculatorType === "guard" ? "Guard" : "Patrol"}
          </div>
        </label>
      </div>
    </div>
    
    <div className="right-toggle">
      {/* Client View Toggle */}
      <div className="flex items-center border-2 border-solid rounded-md p-2 header-toggle">
        <label
          htmlFor="clientViewToggle"
          className="flex items-center cursor-pointer"
        >
          <div className="mr-3 font-medium text-gray-700"></div>
          <div className="relative">
            <input
              type="checkbox"
              id="clientViewToggle"
              className="sr-only"
              checked={clientView}
              onChange={toggleClientView}
            />
            <div
              className={`block w-10 h-6 rounded-full transition ${
                clientView ? "bg-green-600" : "bg-blue-800"
              }`}
            ></div>
            <div
              className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${
                clientView ? "translate-x-4" : ""
              }`}
            ></div>
          </div>
          <div className="ml-2 font-medium text-gray-700">
            {clientView ? "Client" : "M I P"}
          </div>
        </label>
      </div>
    </div>
  </div>
</div>
        {/* Calculator Content with animation */}
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
          v3.04 - Combined Guard and Patrol Calculator
        </div>
      </div>
    );
  }
  //===================================================
  // GUARD CALCULATOR COMPONENT
  //===================================================
  function MIPSecurityCalculator({ clientView }) {
    // Constants
    const DEFAULT_PAY_RATES = {
      unarmed: 23.0,
      armed: 25.0,
      longArm: 26.0,
      protection: 27.0
    };

    // Constants for W-9 rates
    const W9_PAY_RATES = {
      unarmed: 30.0,
      armed: 33.0,
      longArm: 34.0,
      protection: 35.0
    };

    const TARGET_BILL_RATES = {
      unarmed: 43.75,
      armed: 50.0,
      longArm: 55.0,
      protection: 75.0
    };

    const TARGET_PROFIT_PERCENTAGES = {
      unarmed: 17.0,
      armed: 19.0,
      longArm: 22.0,
      protection: 30.0
    };

    // W-9 profit percentages by service type
    const W9_PROFIT_PERCENTAGES = {
      unarmed: 20.0,
      armed: 25.0,
      longArm: 26.0,
      protection: 30.0
    };

    const VEHICLE_RATE = 10.0;
    const WARNING_PROFIT_PERCENTAGE = 10.0;

    // Standard expense factor is 0.73 (73%)
    const STANDARD_EXPENSE_FACTOR = 0.73;
    // W-9 expense factor is .27 (27%)
    const W9_EXPENSE_FACTOR = 0.27;

    // State for user inputs
    const [inputs, setInputs] = React.useState({
      serviceType: "unarmed",
      longArm: false,
      guards: 1,
      hoursPerDay: 8,
      daysPerWeek: 5,
      expenseFactor: STANDARD_EXPENSE_FACTOR,
      travelTime: 30,
      chargeTravel: false,
      vehicleNeeded: false,
      vehicleHours: 8,
      enableDiscounts: false,
      profitMargin: TARGET_PROFIT_PERCENTAGES.unarmed,
      isW9: false, // New state for W-9 toggle
      payRates: {
        unarmed: DEFAULT_PAY_RATES.unarmed,
        armed: DEFAULT_PAY_RATES.armed,
        longArm: DEFAULT_PAY_RATES.longArm,
        protection: DEFAULT_PAY_RATES.protection
      }
    });

    // State for results
    const [results, setResults] = React.useState({
      hourlyCharge: 0,
      totalCharge: 0,
      mipCost: 0,
      laborCost: 0,
      vehicleCost: 0,
      travelCost: 0,
      profitAmount: 0,
      profitPercentage: 0,
      adjustedProfit: 0,
      adjustedProfitPercentage: 0,
      totalHours: 0,
      travelHours: 0,
      vehicleHours: 0,
      discount: 0,
      discountAmount: 0,
      weeklyRevenue: 0,
      discountApplied: false,
      hoursForDiscount: 0
    });

    // References for charts
    const costChartRef = React.useRef(null);
    const breakdownChartRef = React.useRef(null);
    const costChartInstance = React.useRef(null);
    const breakdownChartInstance = React.useRef(null);

    // Handle input changes
function handleChange(e) {
  const { id, value, type, checked } = e.target;


      // Handle checkbox separately
      if (type === "checkbox") {
        if (id === "longArm") {
          setInputs({
            ...inputs,
            [id]: checked,
            profitMargin: checked
              ? TARGET_PROFIT_PERCENTAGES.longArm
              : TARGET_PROFIT_PERCENTAGES.armed
          });
        } else if (id === "isW9") {
          // Handle W-9 toggle
          const newPayRates = checked
            ? { ...W9_PAY_RATES }
            : { ...DEFAULT_PAY_RATES };

          // Determine the appropriate profit margin based on service type and W9 status
          let newProfitMargin;
          if (checked) {
            // W9 is checked, use W9 profit percentages
            if (inputs.serviceType === "armed" && inputs.longArm) {
              newProfitMargin = W9_PROFIT_PERCENTAGES.longArm;
            } else {
              newProfitMargin = W9_PROFIT_PERCENTAGES[inputs.serviceType];
            }
          } else {
            // W9 is unchecked, use standard target profit percentages
            if (inputs.serviceType === "armed" && inputs.longArm) {
              newProfitMargin = TARGET_PROFIT_PERCENTAGES.longArm;
            } else {
              newProfitMargin = TARGET_PROFIT_PERCENTAGES[inputs.serviceType];
            }
          }

          const newExpenseFactor = checked
            ? W9_EXPENSE_FACTOR
            : STANDARD_EXPENSE_FACTOR;

          setInputs({
            ...inputs,
            isW9: checked,
            payRates: newPayRates,
            profitMargin: newProfitMargin,
            expenseFactor: newExpenseFactor
          });
        } else {
          setInputs({
            ...inputs,
            [id]: checked
          });
        }
        return;
      }

      // Handle service type selection
      if (id === "serviceType") {
        if (value !== "armed") {
          setInputs({
            ...inputs,
            serviceType: value,
            longArm: false,
            profitMargin: inputs.isW9
              ? W9_PROFIT_PERCENTAGES[value]
              : TARGET_PROFIT_PERCENTAGES[value]
          });
        } else {
          setInputs({
            ...inputs,
            serviceType: value,
            profitMargin: inputs.isW9
              ? W9_PROFIT_PERCENTAGES.armed
              : TARGET_PROFIT_PERCENTAGES.armed
          });
        }
        return;
      }

      // Handle pay rate changes
      if (id.startsWith("payRate_")) {
        const rateType = id.split("_")[1];
        setInputs({
          ...inputs,
          payRates: {
            ...inputs.payRates,
            [rateType]: value === "" ? "" : parseFloat(value)
          }
        });
        return;
      }

      // Handle profit margin slider
      if (id === "profitMargin") {
        setInputs({
          ...inputs,
          profitMargin: parseFloat(value) || TARGET_PROFIT_PERCENTAGES.unarmed
        });
        return;
      }

      // Handle expense factor
      if (id === "expenseFactor") {
        setInputs({
          ...inputs,
          expenseFactor:
            value === "" ? "" : parseFloat(value)
        });
        return;
      }

      setInputs({
  ...inputs,
  [id]: value === "" ? "" : parseFloat(value)
});
}
    // Calculate results when inputs change
    React.useEffect(() => {
      calculate();
    }, [inputs]);

    // Update charts when results change
    React.useEffect(() => {
      if (results.hourlyCharge > 0) {
        try {
          updateCharts();
        } catch (err) {
          console.error("Chart update error:", err);
        }
      }
    }, [results, clientView]);

    // Calculate discount based on hours of service
    function calculateVolumeDiscount(totalHours, enableDiscounts) {
      // If discounts not enabled, return 0
      if (!enableDiscounts)
        return { discountRate: 0, discountApplied: false, hoursForDiscount: 0 };

      // Only apply discount if over 100 hours total per week
      if (totalHours <= 100) {
        return {
          discountRate: 0,
          discountApplied: false,
          hoursForDiscount: 140 - totalHours // Need 140 hours for first discount tier
        };
      }

      // First full 0.5% discount at 140 hours (100 + 40)
      // Calculate how many complete 40-hour blocks after the first 100 hours
      const additionalHours = totalHours - 100;
      const additionalBlocks = Math.floor(additionalHours / 40);

      // Each block of 40 hours gives 0.5% discount, maximum 10 blocks (5%)
      const discountBlocks = Math.min(additionalBlocks, 10);
      const discountPercentage = discountBlocks * 0.5;

      // No blocks yet? Show how many more hours needed
      if (discountBlocks === 0) {
        return {
          discountRate: 0,
          discountApplied: false,
          hoursForDiscount: 140 - totalHours
        };
      }

      // Convert percentage to decimal (e.g., 1.0% to 0.01)
      return {
        discountRate: discountPercentage / 100,
        discountApplied: true,
        hoursForDiscount: 0
      };
    }

    // Main calculation function
    function calculate() {
      // Guard against invalid inputs
      if (
        inputs.hoursPerDay <= 0 ||
        inputs.daysPerWeek <= 0 ||
        inputs.guards <= 0
      )
        return;

      // Get base pay rate based on service type
      let basePayRate;
      if (inputs.serviceType === "unarmed") {
        basePayRate = inputs.payRates.unarmed;
      } else if (inputs.serviceType === "armed") {
        basePayRate = inputs.longArm
          ? inputs.payRates.longArm
          : inputs.payRates.armed;
      } else if (inputs.serviceType === "protection") {
        basePayRate = inputs.payRates.protection;
      }

      // Time calculations
      const totalWeeklyHours =
        inputs.hoursPerDay * inputs.daysPerWeek * inputs.guards;

      // Travel time calculation - now separate from billing
      const travelTimeHours =
        (inputs.travelTime / 60) * inputs.daysPerWeek * inputs.guards; // Convert to hours

      // Add labor costs - include expense factor for overhead
      const laborRate = basePayRate * (1 + inputs.expenseFactor);
      const laborCost = laborRate * totalWeeklyHours;

      // Travel cost - always calculated but may not be included in billing
      const travelCost = laborRate * travelTimeHours;

      // Vehicle costs - now treated as a flat hourly add-on
      const vehicleHoursPerWeek = inputs.vehicleNeeded
        ? inputs.hoursPerDay * inputs.daysPerWeek
        : 0; // Using regular service hours
      const vehicleCost = vehicleHoursPerWeek * VEHICLE_RATE;

      // Calculate total cost before profit
      const totalCostBeforeProfit =
        laborCost + (inputs.vehicleNeeded ? vehicleCost : 0);

      // Calculate volume discount
      const {
        discountRate,
        discountApplied,
        hoursForDiscount
      } = calculateVolumeDiscount(totalWeeklyHours, inputs.enableDiscounts);

      // Use slider value for profit percentage
      const targetProfitRate = inputs.profitMargin / 100;

      // Calculate profit amount
      const profitAmount =
        (totalCostBeforeProfit * targetProfitRate) / (1 - targetProfitRate);

      // Calculate charge before discount
      const chargeBeforeDiscount = totalCostBeforeProfit + profitAmount;

      // Apply discount
      const discountAmount = chargeBeforeDiscount * discountRate;
      const totalCharge = chargeBeforeDiscount - discountAmount;

      // Calculate hourly charge based on service hours
      const hourlyCharge = totalCharge / totalWeeklyHours;

      // Calculate actual profit percentage before discount
      const profitPercentage = (profitAmount / chargeBeforeDiscount) * 100;

      // Calculate adjusted profit after discount
      const adjustedProfit = profitAmount - discountAmount;
      const adjustedProfitPercentage = (adjustedProfit / totalCharge) * 100;

      // Calculate total weekly revenue (including travel if charged)
      const weeklyRevenue =
        totalCharge + (inputs.chargeTravel ? travelCost : 0);

      // Update results
      setResults({
        hourlyCharge,
        totalCharge,
        mipCost: totalCostBeforeProfit,
        laborCost,
        vehicleCost,
        travelCost,
        profitAmount,
        profitPercentage,
        adjustedProfit,
        adjustedProfitPercentage,
        totalHours: totalWeeklyHours,
        travelHours: travelTimeHours,
        vehicleHours: vehicleHoursPerWeek,
        discount: discountRate,
        discountAmount,
        weeklyRevenue,
        discountApplied,
        hoursForDiscount
      });
    }

    // Update charts with new data
    function updateCharts() {
      // Destroy existing charts
      if (costChartInstance.current) {
        costChartInstance.current.destroy();
        costChartInstance.current = null;
      }

      if (breakdownChartInstance.current) {
        breakdownChartInstance.current.destroy();
        breakdownChartInstance.current = null;
      }

      // Wait for DOM to update
      setTimeout(() => {
        try {
          // Common chart options with white text
          const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 20,
                  boxWidth: 15,
                  font: {
                    size: 12,
                    weight: "bold"
                  },
                  color: "#ffffff"
                }
              },
              tooltip: {
                backgroundColor: "#1a365d",
                titleColor: "#ffffff",
                bodyColor: "#ffffff",
                borderColor: "#3a5e96",
                borderWidth: 1
              }
            }
          };

          // Prepare cost breakdown data
          const costDataItems = [
            {
              label: "Labor Cost",
              value: results.laborCost,
              color: "rgba(185, 10, 13, 0.7)",
              border: "rgba(185, 10, 13, 1)"
            }
          ];

          if (results.vehicleCost > 0) {
            costDataItems.push({
              label: "Vehicle Cost",
              value: results.vehicleCost,
              color: "rgba(52, 152, 219, 0.7)",
              border: "rgba(52, 152, 219, 1)"
            });
          }

          if (inputs.chargeTravel && results.travelCost > 0) {
            costDataItems.push({
              label: "Travel Cost",
              value: results.travelCost,
              color: "rgba(155, 89, 182, 0.7)",
              border: "rgba(155, 89, 182, 1)"
            });
          }

          // Only show profit in chart if not in client view
          if (!clientView) {
            // Show adjusted profit in chart if discount applied, otherwise show original profit
            if (inputs.enableDiscounts && results.discountApplied) {
              costDataItems.push({
                label: "Profit (After Discount)",
                value: results.adjustedProfit,
                color: "rgba(35, 174, 56, 0.7)",
                border: "rgba(35, 174, 56, 1)"
              });
            } else {
              costDataItems.push({
                label: "Profit",
                value: results.profitAmount,
                color: "rgba(35, 174, 56, 0.7)",
                border: "rgba(35, 174, 56, 1)"
              });
            }
          }

          const costData = {
            labels: costDataItems.map((item) => item.label),
            datasets: [
              {
                data: costDataItems.map((item) => item.value),
                backgroundColor: costDataItems.map((item) => item.color),
                borderColor: costDataItems.map((item) => item.border),
                borderWidth: 1
              }
            ]
          };

          // Prepare service type breakdown data
          const serviceLabels = [];
          const serviceData = [];
          const serviceColors = [];
          const serviceBorders = [];

          // Add security officers
          let serviceLabel = "";
          if (inputs.serviceType === "unarmed") {
            serviceLabel = "Unarmed Security";
          } else if (inputs.serviceType === "armed") {
            serviceLabel = inputs.longArm
              ? "Armed Security with Long Arm"
              : "Armed Security";
          } else if (inputs.serviceType === "protection") {
            serviceLabel = "Executive Protection";
          }

          const serviceCost = clientView
            ? results.laborCost + results.profitAmount
            : results.laborCost;

          serviceLabels.push(serviceLabel);
          serviceData.push(serviceCost);
          serviceColors.push("rgba(185, 10, 13, 0.7)");
          serviceBorders.push("rgba(185, 10, 13, 1)");

          // Add travel if charged
          if (inputs.chargeTravel && results.travelCost > 0) {
            serviceLabels.push("Travel Time");
            serviceData.push(results.travelCost);
            serviceColors.push("rgba(155, 89, 182, 0.7)");
            serviceBorders.push("rgba(155, 89, 182, 1)");
          }

          // Add vehicle if needed
          if (inputs.vehicleNeeded) {
            serviceLabels.push("Security Vehicle");
            serviceData.push(
              clientView
                ? results.vehicleCost +
                    results.profitAmount *
                      (results.vehicleCost / results.mipCost)
                : results.vehicleCost
            );
            serviceColors.push("rgba(52, 152, 219, 0.7)");
            serviceBorders.push("rgba(52, 152, 219, 1)");
          }

          const breakdownData = {
            labels: serviceLabels,
            datasets: [
              {
                data: serviceData,
                backgroundColor: serviceColors,
                borderColor: serviceBorders,
                borderWidth: 1
              }
            ]
          };

          // Chart options
          const chartOptions = {
            ...commonOptions,
            plugins: {
              ...commonOptions.plugins,
              tooltip: {
                ...commonOptions.plugins.tooltip,
                callbacks: {
                  label: function (context) {
                    let label = context.label || "";
                    let value = context.raw.toFixed(2);
                    return `${label}: $${value}`;
                  }
                }
              }
            }
          };

          // Create charts
          if (costChartRef.current) {
            costChartInstance.current = new Chart(costChartRef.current, {
              type: "pie",
              data: costData,
              options: chartOptions
            });
          }

          if (breakdownChartRef.current) {
            breakdownChartInstance.current = new Chart(
              breakdownChartRef.current,
              {
                type: "pie",
                data: breakdownData,
                options: chartOptions
              }
            );
          }
        } catch (err) {
          console.error("Error creating charts:", err);
        }
      }, 50);
    }

    // Helper functions
    const getProfitWarningClass = () => {
      if (inputs.profitMargin >= TARGET_PROFIT_PERCENTAGES.unarmed) {
        return "profit-good";
      } else if (inputs.profitMargin >= WARNING_PROFIT_PERCENTAGE) {
        return "profit-warning";
      } else {
        return "profit-danger";
      }
    };
const getSliderColorClass = () => {
  if (inputs.profitMargin >= 30) {
    return "slider-blue";
  } else if (inputs.profitMargin >= TARGET_PROFIT_PERCENTAGES.unarmed) {
    return "slider-good";
  } else if (inputs.profitMargin >= WARNING_PROFIT_PERCENTAGE) {
    return "slider-warning";
  } else {
    return "slider-danger";
  }
};
    const getServiceTypeName = () => {
      if (inputs.serviceType === "unarmed") {
        return "Unarmed Security";
      } else if (inputs.serviceType === "armed") {
        return inputs.longArm
          ? "Armed Security with Long Arm"
          : "Armed Security";
      } else if (inputs.serviceType === "protection") {
        return "Executive Protection";
      } else {
        return "Security Service";
      }
    };

    const getRecommendedProfitMargin = () => {
      if (inputs.isW9) {
        if (inputs.serviceType === "armed" && inputs.longArm) {
          return W9_PROFIT_PERCENTAGES.longArm;
        }
        return W9_PROFIT_PERCENTAGES[inputs.serviceType];
      }

      if (inputs.serviceType === "armed" && inputs.longArm) {
        return TARGET_PROFIT_PERCENTAGES.longArm;
      }
      return TARGET_PROFIT_PERCENTAGES[inputs.serviceType];
    };
    // JSX for Guard Calculator
    return (
      <div>
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Security Services Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Input Parameters
            </h2>

            <div className="mb-4">
              <label htmlFor="serviceType" className="block font-medium mb-1">
                Security Service Type:
              </label>
              <select
                id="serviceType"
                value={inputs.serviceType}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-lg"
              >
                <option value="unarmed">Unarmed Security</option>
                <option value="armed">Armed Security</option>
                <option value="protection">Executive Protection</option>
              </select>
            </div>

            {/* Long Arm option (only visible when Armed is selected) */}
            {inputs.serviceType === "armed" && (
              <div className="mb-4 pl-4 border-l-4 border-amber-500">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="longArm"
                    checked={inputs.longArm}
                    onChange={handleChange}
                    className="h-5 w-5 text-blue-600"
                  />
                  <label htmlFor="longArm" className="ml-2 block font-medium">
                    Include Long Arm
                  </label>
                </div>
              </div>
            )}

            {/* W-9 Toggle Switch */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <label
                htmlFor="isW9"
                className="flex items-center cursor-pointer"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    id="isW9"
                    className="sr-only"
                    checked={inputs.isW9}
                    onChange={handleChange}
                  />
                  <div
                    className={`block w-10 h-6 rounded-full transition ${
                      inputs.isW9 ? "bg-green-500" : "bg-gray-600"
                    }`}
                  ></div>
                  <div
                    className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${
                      inputs.isW9 ? "translate-x-4" : ""
                    }`}
                  ></div>
                </div>
                <div className="ml-3 font-medium text-gray-700">
                  {inputs.isW9 ? "W-9 Contractors" : "Internal Guards"}
                </div>
              </label>
              <div className="text-xs text-gray-500 mt-2">
                {inputs.isW9
                  ? "W-9 contractors pay their own taxes and have higher pay rates but lower operational expenses (27%)"
                  : "Internal guards have standard pay rates with standard operational expenses (73%)"}
              </div>
            </div>

            {/* Pay Rate Input */}
            <div className="mb-4">
              <label htmlFor="payRate" className="block font-medium mb-1">
                Guard Pay Rate ($/hr):
              </label>
              <input
                type="number"
                id="payRate"
                value={(() => {
  const currentValue = (() => {
    if (inputs.serviceType === "unarmed") {
      return inputs.payRates.unarmed;
    } else if (inputs.serviceType === "armed") {
      return inputs.longArm
        ? inputs.payRates.longArm
        : inputs.payRates.armed;
    } else if (inputs.serviceType === "protection") {
      return inputs.payRates.protection;
    }
    return 0;
  })();
  
  return currentValue === 0 ? "" : currentValue;
})()}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  const newPayRates = { ...inputs.payRates };

                  if (inputs.serviceType === "unarmed") {
                    newPayRates.unarmed = value;
                  } else if (inputs.serviceType === "armed") {
                    if (inputs.longArm) {
                      newPayRates.longArm = value;
                    } else {
                      newPayRates.armed = value;
                    }
                  } else if (inputs.serviceType === "protection") {
                    newPayRates.protection = value;
                  }

                  setInputs({
                    ...inputs,
                    payRates: newPayRates
                  });
                }}
                onFocus={(e) => e.target.select()}
                className="w-full p-2 border border-gray-300 rounded text-lg"
                min="0"
                step="0.50"
                placeholder={
                  inputs.isW9
                    ? inputs.serviceType === "unarmed"
                      ? "30.00"
                      : inputs.serviceType === "armed"
                      ? inputs.longArm
                        ? "34.00"
                        : "33.00"
                      : "35.00"
                    : inputs.serviceType === "unarmed"
                    ? "23.00"
                    : inputs.serviceType === "armed"
                    ? inputs.longArm
                      ? "26.00"
                      : "25.00"
                    : "27.00"
                }
              />
              <div className="text-xs text-gray-500 mt-1">
                Base pay rate for the security officer{" "}
                {inputs.isW9 ? "(W-9 contractor)" : ""}
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="guards" className="block font-medium mb-1">
                Number of Security Officers:
              </label>
              <input
                type="number"
                id="guards"
                value={inputs.guards}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-lg"
                min="1"
                step="1"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="hoursPerDay" className="block font-medium mb-1">
                Hours Per Day:
              </label>
              <input
                type="number"
                id="hoursPerDay"
                value={inputs.hoursPerDay}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-lg"
                min="1"
                max="24"
                step="0.5"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="daysPerWeek" className="block font-medium mb-1">
                Shifts Per Week:
              </label>
              <input
                type="number"
                id="daysPerWeek"
                value={inputs.daysPerWeek}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-lg"
                min="1"
                max="7"
                step="1"
              />
            </div>

            {/* Profit Margin Slider - Only show if not in client view */}
            {!clientView && (
              <div className="mb-6 bg-blue-800 bg-opacity-30 p-4 rounded-lg">
                <label
                  htmlFor="profitMargin"
                  className="block font-medium mb-1"
                >
                  Target Profit Margin:{" "}
                  <span className={getProfitWarningClass()}>
                    {inputs.profitMargin.toFixed(1)}%
                  </span>
                   <span className="text-xs ml-2">
                        (Recommended: {getRecommendedProfitMargin()}%)
                    </span>
                  {inputs.profitMargin !== getRecommendedProfitMargin()}
                </label>
                <input
                  type="range"
                  id="profitMargin"
                  value={inputs.profitMargin}
                  onChange={handleChange}
                  className={`slider w-full ${getSliderColorClass()}`}
                  min="5"
                  max="50"
                  step="0.5"
                />
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
                              <c1>Profit in <y1>Yellow needs Fincial Approval
              </y1>
              </c1>
              <div>
              </div>
              <c1>Profit in <r1>Red Requires CEO Approval </r1>  
              </c1>
              </div>
            )}

            {/* Only show expense factor if not in client view */}
            {!clientView && (
              <div className="mb-4">
                <label
                  htmlFor="expenseFactor"
                  className="block font-medium mb-1"
                >
                  Expense Factor:
                </label>
                <input
                  type="number"
                  id="expenseFactor"
                  value={inputs.expenseFactor}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-lg"
                  min="0"
                  max="1"
                  step="0.01"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {inputs.isW9
                    ? "Operating expense ratio for W-9 contractors (default: 27%)"
                    : "Factor to account for overhead (default: 73% overhead)"}
                </div>
              </div>
            )}

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="chargeTravel"
                  checked={inputs.chargeTravel}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600"
                />
                <label
                  htmlFor="chargeTravel"
                  className="ml-2 block font-medium"
                >
                  Charge for Travel Time
                </label>
              </div>

              {inputs.chargeTravel && (
                <div className="pl-7 mt-2">
                  <label
                    htmlFor="travelTime"
                    className="block font-medium mb-1"
                  >
                    Daily Travel Time (minutes):
                  </label>
                  <input
                    type="number"
                    id="travelTime"
                    value={inputs.travelTime}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded text-lg"
                    min="0"
                    step="5"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Average daily commute/travel time for security personnel
                  </div>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="vehicleNeeded"
                  checked={inputs.vehicleNeeded}
                  onChange={handleChange}
                  className="h-5 w-5 text-blue-600"
                />
                <label
                  htmlFor="vehicleNeeded"
                  className="ml-2 block font-medium"
                >
                  Include Security Vehicle (${VEHICLE_RATE.toFixed(2)}/hr)
                </label>
              </div>
              <div className="text-xs text-gray-500 pl-7">
                Flat rate added per service hour
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm mt-4">
              <h3 className="font-semibold text-gray-700 mb-1">Tips</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>
                  Unarmed security is optimal for monitoring and observation
                </li>
                <li>
                  Armed security provides deterrence and response capabilities
                </li>
                <li>Executive protection includes close personal security</li>
                <li>
                  Volume discounts apply for schedules over 100 total hours/week
                  across all officers (0.5% per additional 40 hours after 100)
                </li>
                {inputs.isW9 && (
                  <li>
                    W-9 contractors have higher pay rates but lower operational
                    costs
                  </li>
                )}
              </ul>

              {/* Discount Toggle */}
              <div className="mt-4 pt-2 border-t border-blue-300">
                <label
                  htmlFor="enableDiscounts"
                  className="flex items-center cursor-pointer"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="enableDiscounts"
                      className="sr-only"
                      checked={inputs.enableDiscounts}
                      onChange={handleChange}
                    />
                    <div
                      className={`block w-10 h-6 rounded-full transition ${
                        inputs.enableDiscounts ? "bg-green-500" : "bg-gray-600"
                      }`}
                    ></div>
                    <div
                      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${
                        inputs.enableDiscounts ? "translate-x-4" : ""
                      }`}
                    ></div>
                  </div>
                  <div className="ml-3 font-medium text-gray-700">
                    {inputs.enableDiscounts
                      ? "Volume Discounts Enabled"
                      : "Volume Discounts Disabled"}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6 lg:col-span-2">
            {/* Main Result */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2 text-center">
                Recommended Pricing
              </h2>

              <div className="text-4xl font-bold text-center mb-2">
                ${results.hourlyCharge.toFixed(2)}{" "}
                <span className="text-base">per hour</span>
              </div>

              <div className="text-center text-blue-100">
                ${results.weeklyRevenue.toFixed(2)} total per week
                {results.discountApplied && (
                  <span className="ml-2 text-green-300">
                    (includes {(results.discount * 100).toFixed(1)}% volume
                    discount)
                  </span>
                )}
              </div>
              <div className="text-center text-blue-100">
                ${(results.weeklyRevenue * 4.33).toFixed(2)} total per month
                {results.discountApplied && (
                  <span className="ml-2 text-green-300">
                    (includes {(results.discount * 100).toFixed(1)}% volume
                    discount)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-white bg-opacity-20 p-2 rounded">
                  <div className="text-sm text-blue-100">Service Type</div>
                  <div className="text-lg font-semibold">
                    {getServiceTypeName()}
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 p-2 rounded">
                  <div className="text-sm text-blue-100">Officers</div>
                  <div className="text-lg font-semibold">{inputs.guards}</div>
                </div>
                <div className="bg-white bg-opacity-20 p-2 rounded">
                  <div className="text-sm text-blue-100">Hours/Week</div>
                  <div className="text-lg font-semibold">
                    {results.totalHours}
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 p-2 rounded">
                  <div className="text-sm text-blue-100">Vehicle</div>
                  <div className="text-lg font-semibold">
                    {inputs.vehicleNeeded ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cost Breakdown with Chart */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Cost Breakdown
                </h3>

                <div className="h-60 mb-6">
                  <canvas ref={costChartRef} className="cost-chart"></canvas>
                </div>

                <div className="space-y-2">
                  {!clientView ? (
                    <div className="flex justify-between mb-1">
                      <span>MIP's total cost:</span>
                      <span className="font-medium">
                        ${results.mipCost.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between mb-1">
                      <span>Total cost:</span>
                      <span className="font-medium">
                        ${results.totalCharge.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between mb-1 text-sm text-gray-600">
                    <span>Labor cost:</span>
                    <span>${results.laborCost.toFixed(2)}</span>
                  </div>

                  {inputs.vehicleNeeded && (
                    <div className="flex justify-between mb-1 text-sm text-gray-600">
                      <span>Vehicle cost:</span>
                      <span>${results.vehicleCost.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Travel cost shown if travel time exists */}
                  {results.travelHours > 0 && (
                    <div className="flex justify-between mb-1 text-sm text-gray-600">
                      <span>
                        Travel cost {!inputs.chargeTravel && "(not charged)"}:
                      </span>
                      <span>${results.travelCost.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Only show profit info when not in client view */}
                  {!clientView && (
                    <div className="flex justify-between mb-1 text-sm profit-info">
                      <span>Profit ({inputs.profitMargin.toFixed(1)}%):</span>
                      <span className={getProfitWarningClass()}>
                        ${results.profitAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {inputs.enableDiscounts && (
                    <div className="flex justify-between mb-1 text-sm text-green-600">
                      {results.discountApplied ? (
                        <>
                          <span>
                            Volume discount (
                            {(results.discount * 100).toFixed(1)}%):
                          </span>
                          <span>-${results.discountAmount.toFixed(2)}</span>
                        </>
                      ) : (
                        <>
                          <span>Volume discount:</span>
                          <span>
                            {results.hoursForDiscount > 0
                              ? `${results.hoursForDiscount.toFixed(
                                  0
                                )} more hours needed`
                              : "Not applied"}
                          </span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Add adjusted profit section when discount is applied - only when not in client view */}
                  {!clientView &&
                    inputs.enableDiscounts &&
                    results.discountApplied && (
                      <div className="flex justify-between mb-1 text-sm border-t border-blue-700 mt-2 pt-2 font-medium profit-info">
                        <span>Adjusted profit after discount:</span>
                        <span
                          className={
                            results.adjustedProfitPercentage >=
                            WARNING_PROFIT_PERCENTAGE
                              ? "profit-good"
                              : "profit-warning"
                          }
                        >
                          ${results.adjustedProfit.toFixed(2)} (
                          {results.adjustedProfitPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Service Breakdown with Chart */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Service Breakdown
                </h3>

                <div className="h-60 mb-6">
                  <canvas
                    ref={breakdownChartRef}
                    className="breakdown-chart"
                  ></canvas>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between mb-1">
                    <span>Total weekly revenue:</span>
                    <span className="font-medium">
                      ${results.weeklyRevenue.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between mb-1 text-sm text-gray-600">
                    <span>{getServiceTypeName()}:</span>
                    <span>
                      ${results.laborCost.toFixed(2)}{" "}
                      {!clientView && (
                        <span className="profit-info">+ profit</span>
                      )}
                    </span>
                  </div>

                  {results.travelHours > 0 && (
                    <div className="flex justify-between mb-1 text-sm text-gray-600">
                      <span>Travel Time:</span>
                      <span>
                        ${results.travelCost.toFixed(2)}
                        {!inputs.chargeTravel && " (not charged)"}
                      </span>
                    </div>
                  )}

                  {inputs.vehicleNeeded && (
                    <div className="flex justify-between mb-1 text-sm text-gray-600">
                      <span>Security Vehicle:</span>
                      <span>
                        ${results.vehicleCost.toFixed(2)}{" "}
                        {!clientView && (
                          <span className="profit-info">+ profit</span>
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between mb-1 text-sm text-gray-500">
                    <span>Hourly rate:</span>
                    <span>${results.hourlyCharge.toFixed(2)}/hour</span>
                  </div>

                  {inputs.daysPerWeek < 7 && (
                    <div className="mt-2 text-xs text-blue-600">
                      Add weekend coverage for comprehensive protection
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Detailed Metrics */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">
                Advanced Metrics
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Base Pay Rate</div>
                  <div className="text-lg font-semibold">
                    $
                    {(() => {
                      if (inputs.serviceType === "unarmed") {
                        return inputs.payRates.unarmed.toFixed(2);
                      } else if (inputs.serviceType === "armed") {
                        return inputs.longArm
                          ? inputs.payRates.longArm.toFixed(2)
                          : inputs.payRates.armed.toFixed(2);
                      } else if (inputs.serviceType === "protection") {
                        return inputs.payRates.protection.toFixed(2);
                      }
                      return "0.00";
                    })()}
                    /hr
                  </div>
                </div>

                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Target Bill Rate</div>
                  <div className="text-lg font-semibold">
                    $
                    {(() => {
                      if (inputs.serviceType === "unarmed") {
                        return TARGET_BILL_RATES.unarmed.toFixed(2);
                      } else if (inputs.serviceType === "armed") {
                        return inputs.longArm
                          ? TARGET_BILL_RATES.longArm.toFixed(2)
                          : TARGET_BILL_RATES.armed.toFixed(2);
                      } else if (inputs.serviceType === "protection") {
                        return TARGET_BILL_RATES.protection.toFixed(2);
                      }
                      return "0.00";
                    })()}
                    /hr
                  </div>
                </div>

                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Monthly Revenue</div>
                  <div className="text-lg font-semibold">
                    ${(results.weeklyRevenue * 4.33).toFixed(2)}
                  </div>
                </div>

                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Annual Revenue</div>
                  <div className="text-lg font-semibold">
                    ${(results.weeklyRevenue * 52).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-gray-500 italic">
                Note: Expense factor accounts for all overhead costs including
                training, equipment, insurance, and administrative expenses.
                {inputs.isW9 &&
                  " W-9 contractors have reduced overhead due to self-employment."}
                {inputs.vehicleNeeded &&
                  " Vehicle costs are calculated as a flat rate per service hour."}
                {results.travelHours > 0 &&
                  " Travel time is calculated separately."}
                {inputs.enableDiscounts &&
                  results.discountApplied &&
                  ` Volume discount of ${(results.discount * 100).toFixed(
                    1
                  )}% applied.`}
              </div>
            </div>

            {/* Display W9 Status */}
            {inputs.isW9 && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200 text-green-800">
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-medium">
                    W-9 Contractor Rates Applied
                  </span>
                </div>
                <div className="text-xs mt-1 ml-7">
                  Calculations using W-9 contractor rates with modified expense
                  factor
                </div>
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
    // Constants
    const PROFIT_MARGIN = 42.85; // Adjusted to yield ~30% profit of total

    // Calculate discount based on number of stops
    const calculateDiscount = (numStops, enableDiscounts) => {
      if (!enableDiscounts || numStops <= 3) return 0;
      // Stair-stepping discount: 1% for stop 4, 2% for stop 5, etc., max 10%
      const extraStops = Math.min(numStops - 3, 10); // Cap at 10% discount
      return extraStops / 100; // Convert to decimal (0.01, 0.02, etc.)
    };

    // State for user inputs
    const [inputs, setInputs] = React.useState({
      numStops: 3,
      guardRate: 23,
      expenseFactor: 0.73,
      travelTime: 12,
      timeToNextStop: 5,
      minutesPerStop: 15,
      enableDiscounts: false // New state for discount toggle
    });

    // State for results
    const [results, setResults] = React.useState({
      chargePerStop: 0,
      mipCost: 0,
      laborCost: 0,
      extraTimeCost: 0,
      profitAmount: 0,
      totalTime: 0,
      travelTime: 0,
      stopTime: 0,
      extraStopTime: 0,
      betweenStopsTime: 0,
      discount: 0,
      totalRevenue: 0
    });

    // References for the charts
    const costChartRef = React.useRef(null);
    const timeChartRef = React.useRef(null);
    const costChart = React.useRef(null);
    const timeChart = React.useRef(null);

    // Handle input changes
    function handleChange(e) {
      const { id, value, type, checked } = e.target;

      // Handle checkbox separately
      if (type === "checkbox") {
        setInputs({
          ...inputs,
          [id]: checked
        });
        return;
      }

      setInputs({
  ...inputs,
  [id]: value === "" ? "" : parseFloat(value)
});
    }

    // Calculate results when inputs change
    React.useEffect(() => {
      calculate();
    }, [inputs]);

    // Update charts when results change
    React.useEffect(() => {
      if (results.chargePerStop > 0) {
        try {
          updateCharts();
        } catch (err) {
          console.error("Chart update error:", err);
        }
      }
    }, [results, clientView]);

    // Main calculation function
    function calculate() {
      // Guard against invalid inputs
      if (inputs.numStops <= 0) return;

      // Time calculations (in hours)
      const travelToFirstStopHours = inputs.travelTime / 60; // Travel to first site
      const timeToNextStopHours = inputs.timeToNextStop / 60; // Travel between stops
      const returnTravelHours = inputs.travelTime / 60; // Return from last site

      // Calculate drive time between stops - use timeToNextStop for this, not travelTime
      const driveTimeBetweenStops =
        inputs.numStops > 1 ? (inputs.numStops - 1) * timeToNextStopHours : 0;

      // Time spent at each stop
      const baseMinutes = Math.min(inputs.minutesPerStop, 15);
      const baseTime = (inputs.numStops * baseMinutes) / 60;

      // Extra time beyond the standard 15-minute baseline
      const extraMinutes = Math.max(0, inputs.minutesPerStop - 15);
      const extraTime = (inputs.numStops * extraMinutes) / 60;

      // Total travel time: to first + between stops + from last
      const totalTravelTime =
        travelToFirstStopHours + driveTimeBetweenStops + returnTravelHours;

      // Total time calculation
      const totalTime = totalTravelTime + baseTime + extraTime;

      // Cost calculations - labor rate includes guard rate and all expenses
      const laborRate = inputs.guardRate * (1 + inputs.expenseFactor);
      const laborCost = laborRate * (totalTravelTime + baseTime);

      // Extra time costs (with 30% premium)
      const extraTimeCost = laborRate * 1.3 * extraTime;

      // Total cost before profit
      const totalCostBeforeProfit = laborCost + extraTimeCost;

      // Calculate volume discount based on number of stops
      const discount = calculateDiscount(
        inputs.numStops,
        inputs.enableDiscounts
      );

      // Add profit margin (adjusted to make profit ~30% of total)
      const profitAmount = totalCostBeforeProfit * (PROFIT_MARGIN / 100);
      const totalCharge =
        (totalCostBeforeProfit + profitAmount) * (1 - discount);

      // Per stop calculations
      const chargePerStop = totalCharge / inputs.numStops;
      const mipCost = totalCostBeforeProfit / inputs.numStops;

      // Update results
      setResults({
        chargePerStop,
        mipCost,
        laborCost,
        extraTimeCost,
        profitAmount,
        totalTime: totalTime * 60, // convert back to minutes for display
        travelTime: (travelToFirstStopHours + returnTravelHours) * 60,
        betweenStopsTime: driveTimeBetweenStops * 60,
        stopTime: baseTime * 60,
        extraStopTime: extraTime * 60,
        discount,
        totalRevenue: totalCharge
      });
    }

    // Update charts with new data
    function updateCharts() {
      // Clear existing charts
      if (costChart.current) {
        costChart.current.destroy();
        costChart.current = null;
      }

      if (timeChart.current) {
        timeChart.current.destroy();
        timeChart.current = null;
      }

      // Common chart options with white text
      const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              padding: 20,
              boxWidth: 15,
              font: {
                size: 12,
                weight: "bold"
              },
              color: "#ffffff" // Ensure white text for all chart legends
            }
          },
          tooltip: {
            backgroundColor: "#1a365d",
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            borderColor: "#3a5e96",
            borderWidth: 1
          }
        }
      };

      // Prepare cost data
      const costDataItems = [
        {
          label: "Labor Cost",
          value: results.laborCost,
          color: "rgba(185, 10, 13, 0.7)",
          border: "rgba(185, 10, 13, 1)"
        }
      ];

      if (results.extraTimeCost > 0) {
        costDataItems.push({
          label: "Extra Time Cost",
          value: results.extraTimeCost,
          color: "rgba(243, 156, 18, 0.7)",
          border: "rgba(243, 156, 18, 1)"
        });
      }

      // Only show profit in chart if not in client view
      if (!clientView) {
        costDataItems.push({
          label: "Profit",
          value: results.profitAmount,
          color: "rgba(35, 174, 56, 0.7)",
          border: "rgba(35, 174, 56, 1)"
        });
      }

      const costData = {
        labels: costDataItems.map((item) => item.label),
        datasets: [
          {
            data: costDataItems.map((item) => item.value),
            backgroundColor: costDataItems.map((item) => item.color),
            borderColor: costDataItems.map((item) => item.border),
            borderWidth: 1
          }
        ]
      };

      // Prepare time data
      const timeData = {
        labels: [
          "Travel to/from",
          "Between Stops",
          "At Stops (standard)",
          "Extra Stop Time"
        ],
        datasets: [
          {
            data: [
              results.travelTime,
              results.betweenStopsTime,
              results.stopTime,
              results.extraStopTime
            ],
            backgroundColor: [
              "rgba(52, 152, 219, 0.7)", // Bright blue
              "rgba(235, 14, 18, 0.7)", // Red
              "rgba(235, 147, 14, 0.7)", // Yellow
              "rgba(61, 176, 60, 0.7)" // Green
            ],
            borderColor: [
              "rgba(52, 152, 219, 1)", // Bright blue
              "rgba(235, 14, 18, 1)", // Red
              "rgba(235, 147, 14, 1)", // Yellow
              "rgba(61, 176, 60, 1)" // Green
            ],
            borderWidth: 1
          }
        ]
      };

      // Cost chart options
      const costChartOptions = {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: function (context) {
                let label = context.label || "";
                let value = context.raw.toFixed(2);
                return `${label}: $${value}`;
              }
            }
          }
        }
      };

      // Time chart options
      const timeChartOptions = {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: function (context) {
                let label = context.label || "";
                let value = context.raw.toFixed(0);
                return `${label}: ${value} minutes`;
              }
            }
          }
        }
      };

      // Create fresh charts
      if (costChartRef.current) {
        costChart.current = new Chart(costChartRef.current, {
          type: "pie",
          data: costData,
          options: costChartOptions
        });
      }

      if (timeChartRef.current) {
        timeChart.current = new Chart(timeChartRef.current, {
          type: "pie",
          data: timeData,
          options: timeChartOptions
        });
      }
    }

    // Calculate profit percentage of total
    const profitPercentOfTotal =
      results.profitAmount > 0
        ? (results.profitAmount /
            (results.laborCost +
              results.extraTimeCost +
              results.profitAmount)) *
          100
        : 0;
    return (
      <div>
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Patrol Stop Calculator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Input Parameters
            </h2>

            <div className="mb-4">
              <label htmlFor="numStops" className="block font-medium mb-1">
                Number of Stops Per Night:
              </label>
              <input
                type="number"
                id="numStops"
                value={inputs.numStops}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-lg"
                min="1"
                step="1"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="guardRate" className="block font-medium mb-1">
                Guard Hourly Rate ($):
              </label>
              <input
                type="number"
                id="guardRate"
                value={inputs.guardRate}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-lg"
                min="10"
                step="0.5"
              />
            </div>

            {/* Only show expense factor if not in client view */}
            {!clientView && (
              <div className="mb-4">
                <label
                  htmlFor="expenseFactor"
                  className="block font-medium mb-1"
                >
                  Expense Factor:
                </label>
                <input
                  type="number"
                  id="expenseFactor"
                  value={inputs.expenseFactor}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-lg"
                  min="0"
                  max="1"
                  step="0.01"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Factor to account for overhead (0.73 = 73% overhead)
                </div>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="travelTime" className="block font-medium mb-1">
                Travel Time (minutes to first/from last stop):
              </label>
              <input
                type="number"
                id="travelTime"
                value={inputs.travelTime}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-lg"
                min="0"
                step="1"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="timeToNextStop"
                className="block font-medium mb-1"
              >
                Time To Next Stop (minutes):
              </label>
              <input
                type="number"
                id="timeToNextStop"
                value={inputs.timeToNextStop}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-lg"
                min="0"
                step="1"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="minutesPerStop"
                className="block font-medium mb-1"
              >
                Minutes Per Stop:
              </label>
              <input
                type="number"
                id="minutesPerStop"
                value={inputs.minutesPerStop}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded text-lg"
                min="1"
                step="1"
              />
              <div className="text-xs text-gray-500 mt-1">
                Standard stop is 10-15 minutes (extra time billed at premium
                rate)
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm mt-4">
              <h3 className="font-semibold text-gray-700 mb-1">Tips</h3>
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Standard patrol stops are 10-15 minutes</li>
                <li>Longer stops incur premium charges</li>
                <li>Volume discounts apply for routes with >3 stops</li>
                {!clientView && <li>Profit is set to ~30% of total revenue</li>}
              </ul>

              {/* Discount Toggle */}
              <div className="mt-4 pt-2 border-t border-blue-300">
                <label
                  htmlFor="enableDiscounts"
                  className="flex items-center cursor-pointer"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="enableDiscounts"
                      className="sr-only"
                      checked={inputs.enableDiscounts}
                      onChange={handleChange}
                    />
                    <div
                      className={`block w-10 h-6 rounded-full transition ${
                        inputs.enableDiscounts ? "bg-green-500" : "bg-gray-600"
                      }`}
                    ></div>
                    <div
                      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${
                        inputs.enableDiscounts ? "translate-x-4" : ""
                      }`}
                    ></div>
                  </div>
                  <div className="ml-3 font-medium text-gray-700">
                    {inputs.enableDiscounts
                      ? "Volume Discounts Enabled"
                      : "Volume Discounts Disabled"}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6 lg:col-span-2">
            {/* Main Result */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-2 text-center">
                Recommended Pricing
              </h2>

              <div className="text-4xl font-bold text-center mb-2">
                ${results.chargePerStop.toFixed(2)}{" "}
                <span className="text-base">per stop</span>
              </div>

              <div className="text-center text-blue-100">
                ${results.totalRevenue.toFixed(2)} total for {inputs.numStops}{" "}
                stops
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white bg-opacity-20 p-2 rounded">
                  <div className="text-sm text-blue-100">Total Stops</div>
                  <div className="text-xl font-semibold">{inputs.numStops}</div>
                </div>
                <div className="bg-white bg-opacity-20 p-2 rounded">
                  <div className="text-sm text-blue-100">Minutes/Stop</div>
                  <div className="text-xl font-semibold">
                    {inputs.minutesPerStop}
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 p-2 rounded">
                  <div className="text-sm text-blue-100">Total Time/Shift</div>
                  <div className="text-xl font-semibold">
                    {Math.round(results.totalTime)} min
                  </div>
                </div>{" "}
                <div className="bg-white bg-opacity-20 p-2 rounded">
                  <div className="text-sm text-blue-100">Time Per Month</div>
                  <div className="text-xl font-semibold">
                    {(Math.round(results.totalTime) * 7 * 4.33).toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="bg-white bg-opacity-20 p-2 rounded">
                    <div className="text-sm text-blue-100">Monthly Cilent Bill Average</div>
                    <div className="text-xl font-semibold">
                      ${(results.totalRevenue * 7 * 4.33).toFixed(2)}
                    </div>
                  </div>
                </div>
                <div className="bg-white bg-opacity-20 p-2 rounded">
                  <div className="text-sm text-blue-100">Hourly Rate</div>
                  <div className="text-xl font-semibold">
                    $
                    {((results.totalRevenue / results.totalTime) * 60).toFixed(
                      2
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cost Breakdown with Chart */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Cost Breakdown
                </h3>

                <div className="h-60 mb-6">
                  <canvas ref={costChartRef} className="cost-chart"></canvas>
                </div>

                <div className="space-y-2">
                  {!clientView ? (
                    <div className="flex justify-between mb-1">
                      <span>MIP's cost per stop:</span>
                      <span className="font-medium">
                        ${results.mipCost.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between mb-1">
                      <span>Cost per stop:</span>
                      <span className="font-medium">
                        ${results.chargePerStop.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between mb-1 text-sm text-gray-600">
                    <span>Labor cost:</span>
                    <span>${results.laborCost.toFixed(2)} total</span>
                  </div>

                  {results.extraTimeCost > 0 && (
                    <div className="flex justify-between mb-1 text-sm text-gray-600">
                      <span>Extra time premium:</span>
                      <span>${results.extraTimeCost.toFixed(2)} total</span>
                    </div>
                  )}

                  {/* Only show profit info when not in client view */}
                  {!clientView && (
                    <div className="flex justify-between mb-1 text-sm text-gray-600">
                      <span>Profit:</span>
                      <span>
                        ${results.profitAmount.toFixed(2)} (
                        {profitPercentOfTotal.toFixed(1)}%)
                      </span>
                    </div>
                  )}

                  {inputs.numStops > 3 && inputs.enableDiscounts && (
                    <div className="flex justify-between mb-1 text-sm text-green-600">
                      <span>Volume discount:</span>
                      <span>
                        -$
                        {(
                          results.discount *
                          (results.laborCost +
                            results.extraTimeCost +
                            results.profitAmount)
                        ).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Time Allocation with Chart */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-700 mb-2">
                  Time Allocation
                </h3>

                <div className="h-60 mb-6">
                  <canvas ref={timeChartRef} className="time-chart"></canvas>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between mb-1">
                    <span>Total patrol time:</span>
                    <span className="font-medium">
                      {Math.round(results.totalTime)} minutes
                    </span>
                  </div>

                  <div className="flex justify-between mb-1 text-sm text-gray-600">
                    <span>Travel time (to/from):</span>
                    <span>{Math.round(results.travelTime)} minutes</span>
                  </div>

                  {inputs.numStops > 1 && (
                    <div className="flex justify-between mb-1 text-sm text-gray-600">
                      <span>Between stops:</span>
                      <span>
                        {Math.round(results.betweenStopsTime)} minutes
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between mb-1 text-sm text-gray-600">
                    <span>Time at stops (standard):</span>
                    <span>{Math.round(results.stopTime)} minutes</span>
                  </div>

                  {results.extraStopTime > 0 && (
                    <div className="flex justify-between mb-1 text-sm text-orange-600">
                      <span>Extra time (premium):</span>
                      <span>{Math.round(results.extraStopTime)} minutes</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2">
                Advanced Metrics
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Labor Rate</div>
                  <div className="text-lg font-semibold">
                    $
                    {(inputs.guardRate * (1 + inputs.expenseFactor)).toFixed(2)}
                    /hr
                  </div>
                </div>

                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Premium Rate</div>
                  <div className="text-lg font-semibold">
                    $
                    {(
                      inputs.guardRate *
                      (1 + inputs.expenseFactor) *
                      1.3
                    ).toFixed(2)}
                    /hr
                  </div>
                </div>

                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Cost Per Minute</div>
                  <div className="text-lg font-semibold">
                    ${(results.mipCost / inputs.minutesPerStop).toFixed(2)}
                  </div>
                </div>

                <div className="bg-white p-3 rounded shadow-sm">
                  <div className="text-xs text-gray-500">Revenue Per Hour</div>
                  <div className="text-lg font-semibold">
                    $
                    {((results.totalRevenue / results.totalTime) * 60).toFixed(
                      2
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500 italic">
                Note: Expense factor accounts for all overhead costs including
                vehicle, fuel, insurance, and administrative expenses.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the main app into the root element
  ReactDOM.render(<MIPCalculatorApp />, document.getElementById("root"));
}
