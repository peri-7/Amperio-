import { useState, useEffect } from "react";

export default function FloatingSearch({ onSearch, filters,stations, onStationClick}) {
  const [options, setOptions] = useState({ connectors: [], powers: [] });
  const [openDropdown, setOpenDropdown] = useState(null);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);


  useEffect(()=> {
    if(query.length >1){
      const filtered = stations.filter(s =>
        s.address.toLowerCase().includes(query.toLowerCase())
      ).slice(0,5) //limit to top 5 results
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  },[query,stations]);

  //helper function to bold the matching text
  const getHighlightedText = (text,highlight)=>{
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part,i)=>
        part.toLowerCase() === highlight.toLowerCase()
          ? <b key={i} style={{color: '#ddc41eff'}}>{part}</b>
          :part
        )}
      </span>
    );
  };

  useEffect(() => {
    // FIX: Added // to the URL
    fetch('http://localhost:9876/api/meta/filters')
      .then(res => res.json())
      .then(data => {console.log("Data from backend:", data); setOptions(data)})
      .catch(err => console.error("Metadata fetch failed:", err));
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
          onChange={(e) => { setQuery(e.target.value); onSearch({ q: e.target.value });}}
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
                onSearch({q:""}) //tells the map to fetch all stations again. 
              }}>
                {getHighlightedText(s.address, query)}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="filter-pill-container">
        {/* Power Pill */}
        <div className="dropdown-wrapper">
          <button 
            className={`filter-pill ${filters.power ? 'active' : ''}`} 
            onClick={() => toggleDropdown('power')}
          >
            Power {filters.power ? `: ${filters.power}kW` : ''}
          </button>
          
          {openDropdown === 'power' && (
            <div className="dropdown-menu">
              {options?.powers?.map((p, index) => (
                <button 
                  key={index} // p is just a number (e.g., 50)
                  className={filters.power === p ? 'selected' : ''}
                  onClick={() => {
                    toggleFilter('power', p); // Pass the number p directly
                    setOpenDropdown(null);
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
            className={`filter-pill ${filters.connector ? 'active' : ''}`} 
            onClick={() => toggleDropdown('connector')}
          >
            Connector {filters.connector ? `: ${filters.connector}` : ''}
          </button>
          
          {openDropdown === 'connector' && (
            <div className="dropdown-menu">
              {options?.connectors?.map((c, index) => (
              <button 
                key={index} // c is just a string (e.g., "CCS2")
                className={filters.connector === c ? 'selected' : ''}
                onClick={() => {
                  toggleFilter('connector', c); // Pass the string c directly
                  setOpenDropdown(null);
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
      </div>
    </div>
  );
}