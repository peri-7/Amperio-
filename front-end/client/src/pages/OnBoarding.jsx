import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../axiosConfig";
import "../styles/OnBoarding.css";
import onboardingImage from "../assets/images/onboarding.png";

// This matches your backend utility
const CHARGER_CONFIGS = [
    { power: 11, connectors: ["Type 2"] },
    { power: 22, connectors: ["Type 2"] },
    { power: 50, connectors: ["CCS2", "CCS1", "CHAdeMO"] },
    { power: 120, connectors: ["CCS2", "CCS1"] },
    { power: 180, connectors: ["CCS2", "CCS1"] }
];

const OnBoarding = () => {
    const [selectedPower, setSelectedPower] = useState(null);
    const [selectedConnector, setSelectedConnector] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { updateUser } = useContext(AuthContext);


    // 1. Determine which powers are available based on selected connector
    const availablePowers = selectedConnector
        ? CHARGER_CONFIGS.filter(c => c.connectors.includes(selectedConnector)).map(c => c.power)
        : CHARGER_CONFIGS.map(c => c.power);

    // 2. Determine which connectors are available based on selected power
    const availableConnectors = selectedPower
        ? CHARGER_CONFIGS.find(c => c.power === selectedPower)?.connectors || []
        : [...new Set(CHARGER_CONFIGS.flatMap(c => c.connectors))];

    const handleSubmit = async (e) => {
        e.preventDefault();

        // If nothing is selected, treat it as a skip
        if (!selectedPower && !selectedConnector) {
            navigate("/profile");
            return;
        }

        // If something is selected, perform the save
        setLoading(true);
        try {
            await api.put("/users/profile", {
                default_charger_power: selectedPower,
                default_connector_type: selectedConnector
            });
            await updateUser(); // Update the user context with new defaults
            navigate("/profile");
        } catch (err) {
            alert(err.response?.data?.message || "Error updating preferences");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card">
                <h1 className="onboarding-title">Let the charging begin...</h1>
                <p className="onboarding-intro">
                    Hi, I'm Amperio! Let's customize your charging experience.
                </p>

                <form onSubmit={handleSubmit}>
                    {/* Charger Power Section */}
                    <div className="selection-group">
                        <h3 className="group-label">Preferred Charger Power (kW)</h3>
                        <div className="pills-container">
                            {CHARGER_CONFIGS.map(config => {
                                const isAvailable = availablePowers.includes(config.power);
                                const isSelected = selectedPower === config.power;
                                return (
                                    <button
                                        key={config.power}
                                        type="button"
                                        disabled={!isAvailable}
                                        className={`pill ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled-grey' : ''}`}
                                        onClick={() => isAvailable && setSelectedPower(isSelected ? null : config.power)}                                    >
                                        {config.power} kW
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Connector Type Section */}
                    <div className="selection-group">
                        <h3 className="group-label">Preferred Connector Type</h3>
                        <div className="pills-container">
                            {/* Unique list of all possible connectors */}
                            {[...new Set(CHARGER_CONFIGS.flatMap(c => c.connectors))].map(type => {
                                const isAvailable = availableConnectors.includes(type);
                                const isSelected = selectedConnector === type;
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        disabled={!isAvailable}
                                        className={`pill ${isSelected ? 'selected' : ''} ${!isAvailable ? 'disabled-grey' : ''}`}
onClick={() => isAvailable && setSelectedConnector(isSelected ? null : type)}                                    >
                                        {type}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        type="submit"
                        className={`submit-btn ${(!selectedPower && !selectedConnector) ? 'skip-style' : ''}`}
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : (!selectedPower && !selectedConnector)
                                ? "Skip For Now"
                                : "Save & Let's Charge!"}
                    </button>
                </form>
            </div>
            <img src={onboardingImage} alt="Amperio Mascot" className="onboarding-mascot" />
        </div>
    );
};

export default OnBoarding;