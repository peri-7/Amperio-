import { useState, useEffect, useRef } from "react";
import api from "../../axiosConfig";
import "../../styles/FacilitiesGrid.css";

export default function FloatingSearch({ onSearch, filters, stations, onStationClick }) {
  const [options, setOptions] = useState({ connectors: [], powers: [], facilities: [], score: [] });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  useEffect(() => {
    if (query.length > 1) {
      const filtered = stations.filter(s =>
        s.address.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5) //limit to top 5 results
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query, stations]);

  //helper function to bold the matching text
  const getHighlightedText = (text, highlight) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase()
            ? <b key={i} style={{ color: '#ddc41eff' }}>{part}</b>
            : part
        )}
      </span>
    );
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await api.get('/meta/filters');
        const data = response.data;
        // Defensive check: ensure the data is an object and provide defaults
        setOptions({
          powers: data?.powers || [],
          connectors: data?.connectors || [],
          facilities: data?.facilities || [],
          score: data?.score || [],
        });
      } catch (err) {
        console.error("Metadata fetch failed:", err);
        // In case of error, ensure options are reset to empty arrays
        setOptions({ connectors: [], powers: [], facilities: [], score: [] });
      }
    };

    fetchFilterOptions();
  }, []);

  const toggleFilter = (key, value) => {
    if (filters[key] === value) {
      // Toggle off
      onSearch({ [key]: key === 'available' ? false : "" });
    } else {
      // Toggle on
      onSearch({ [key]: value });
    }
  };

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  return (
    <div className="search-filter-container">
      <div className="search-bar-wrapper">
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            value={query}
            placeholder="Find charging stations..."
            onChange={(e) => { setQuery(e.target.value); onSearch({ q: e.target.value }); }}
          />
        </div>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <ul className="suggestions-list">
            {suggestions.map((s) => (
              <li key={s.station_id} onClick={() => {
                onStationClick(s); // Opens the sidebar
                setQuery("");      // Clear search
                setSuggestions([]);
                onSearch({ q: "" }) //tells the map to fetch all stations again. 
              }}>
                {getHighlightedText(s.address, query)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="filter-pill-container" ref={wrapperRef}>


        {/* Power Pill */}
        <div className="dropdown-wrapper">
          <button
            className={`filter-pill ${filters.power?.length ? 'active' : ''}`}
            onClick={() => toggleDropdown('power')}
          >
            Power {filters.power?.length > 0 ? `: ${filters.power.map(p => `${p}kW`).join(', ')}` : ''}
          </button>

          {openDropdown === 'power' && (
            <div className="dropdown-menu">
              {options?.powers?.map((p, index) => (
                <button
                  key={index} // p is just a number (e.g., 50)
                  //check if p is in the array to keep it yellow
                  className={filters.power?.includes(p) ? 'selected' : ''}
                  onClick={() => {
                    const current = filters.power || [];
                    const next = current.includes(p)
                      ? current.filter(item => item !== p) //remove if already there
                      : [...current, p]; //add if not present
                    onSearch({ power: next });

                  }}
                >
                  {p} kW
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Connector Pill */}
        <div className="dropdown-wrapper">
          <button
            className={`filter-pill ${filters.connector?.length > 0 ? 'active' : ''}`}
            onClick={() => toggleDropdown('connector')}
          >
            Connector {filters.connector?.length > 0 ? `: ${filters.connector.join(', ')}` : ''}
          </button>

          {openDropdown === 'connector' && (
            <div className="dropdown-menu">
              {options?.connectors?.map((c, index) => (
                <button
                  key={index}
                  className={filters.connector?.includes(c) ? 'selected' : ''}
                  onClick={() => {
                    const current = filters.connector || [];
                    const next = current.includes(c)
                      ? current.filter(item => item !== c) //remove if already there
                      : [...current, c];
                    onSearch({ connector: next });
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className={`filter-pill ${filters.available ? 'active' : ''}`}
          onClick={() => toggleFilter('available', true)}
        >
          Available Now
        </button>

        {/* Facilities Pill */}
        <div className="dropdown-wrapper">
          <button
            className={`filter-pill ${filters.facilities && filters.facilities.length > 0 ? 'active' : ''}`}
            onClick={() => toggleDropdown('facilities')}
          >
            Facilities {filters.facilities && filters.facilities.length > 0 ? `(${filters.facilities.length})` : ''}
          </button>

          {openDropdown === 'facilities' && (
            <div className="dropdown-menu facilities-grid">
              {options?.facilities?.map((f, index) => (
                <label key={index} className="facility-checkbox-item">
                  <input
                    type="checkbox"
                    checked={filters.facilities && filters.facilities.includes(f) || false}
                    onChange={() => {
                      const current = filters.facilities || [];
                      const next = current.includes(f)
                        ? current.filter(item => item !== f)
                        : [...current, f];
                      onSearch({ facilities: next });
                    }}
                  />
                  <span>{f}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Score Pill */}
        <div className="dropdown-wrapper">
          <button
            className={`filter-pill ${filters.score?.length ? 'active' : ''}`}
            onClick={() => toggleDropdown('score')}
          >
            Score {filters.score?.length > 0 ? `: ${filters.score.map(s => `${s}+ stars`).join(', ')}` : ''}
          </button>

          {openDropdown === 'score' && (
            <div className="dropdown-menu">
              {options?.score?.map((s, index) => (
                <button
                  key={index}
                  //check if s is in the array to keep it yellow
                  className={filters.score?.includes(s) ? 'selected' : ''}
                  onClick={() => {
                    const current = filters.score || [];
                    const next = current.includes(s)
                      ? current.filter(item => item !== s) //remove if already there
                      : [...current, s]; //add if not present
                    onSearch({ score: next });

                  }}
                >
                  {s}+ stars
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Global Clear Button - Only shows if any filter is active */}
        {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v === true) && (
          <button
            className="clear-filters-btn"
            onClick={() => onSearch({
              connector: [],
              power: [],
              facilities: [],
              score: [],
              available: false
            })}
          >
            Clear All
          </button>
        )}
      </div>
    </div>


  );


}
