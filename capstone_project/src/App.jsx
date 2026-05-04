import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [countries, setCountries] = useState([])
  const [filteredDestinations, setFilteredDestinations] = useState([])
  const [itinerary, setItinerary] = useState([])
  const [budgetItems, setBudgetItems] = useState([])
  const [newItem, setNewItem] = useState('')
  const [newCost, setNewCost] = useState('')
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setStatus('loading')
        // Using REST Countries API for reliable country data
        const response = await fetch(
          'https://restcountries.com/v3.1/all?fields=name,flags,region,capital,population,cca2',
        )
        if (!response.ok) {
          throw new Error('Unable to load country data')
        }

        const data = await response.json()
        const sorted = data.sort((a, b) => a.name.common.localeCompare(b.name.common))
        setCountries(sorted)
        setFilteredDestinations(sorted)
        setStatus('ready')
      } catch (fetchError) {
        setError(fetchError.message)
        setStatus('error')
      }
    }

    fetchCountries()
  }, [])

  useEffect(() => {
    const query = searchQuery.toLowerCase()
    setFilteredDestinations(
      countries.filter((country) => {
        const name = country.name.common.toLowerCase()
        const region = country.region?.toLowerCase() || ''
        const capital = (country.capital?.[0] || '').toLowerCase()
        return name.includes(query) || region.includes(query) || capital.includes(query)
      }),
    )
  }, [searchQuery, countries])

  const addToItinerary = (country) => {
    const destination = country.name.common
    if (!itinerary.some((item) => item.destination === destination)) {
      setItinerary([...itinerary, { destination, date: '', activities: [], flag: country.flags.svg }])
    }
  }

  const updateItinerary = (index, field, value) => {
    const nextItinerary = itinerary.map((item, idx) =>
      idx === index ? { ...item, [field]: value } : item,
    )
    setItinerary(nextItinerary)
  }

  const addActivity = (index, activity) => {
    const nextItinerary = itinerary.map((item, idx) =>
      idx === index
        ? { ...item, activities: [...item.activities, activity] }
        : item,
    )
    setItinerary(nextItinerary)
  }

  const addBudgetItem = () => {
    if (newItem.trim() && newCost) {
      setBudgetItems([...budgetItems, { item: newItem.trim(), cost: parseFloat(newCost) }])
      setNewItem('')
      setNewCost('')
    }
  }

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.cost, 0)
  const destinationCount = countries.length

  return (
    <div className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Travel planning reimagined</p>
          <h1>Trip Architect</h1>
          <p className="subtitle">Discover countries with live API data and build a richer itinerary.</p>
        </div>

        <nav>
          <button onClick={() => setActiveTab('search')} className={activeTab === 'search' ? 'active' : ''}>
            Destinations
          </button>
          <button onClick={() => setActiveTab('itinerary')} className={activeTab === 'itinerary' ? 'active' : ''}>
            Itinerary
          </button>
          <button onClick={() => setActiveTab('budget')} className={activeTab === 'budget' ? 'active' : ''}>
            Budget
          </button>
        </nav>
      </header>

      <main className="main">
        {activeTab === 'search' && (
          <section className="search-panel">
            <div className="panel-header">
              <div>
                <h2>Search Countries</h2>
                <p>Use live country data from the REST Countries API.</p>
              </div>
              <div className="stats-card">
                <span>{destinationCount}</span>
                <p>countries available</p>
              </div>
            </div>

            <div className="search-bar">
              <input
                type="text"
                placeholder="Search by country, region, or capital"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {status === 'loading' && <div className="status-message">Loading country data...</div>}
            {status === 'error' && <div className="status-message error">{error}</div>}

            <div className="results-grid">
              {filteredDestinations.map((country) => (
                <article key={country.cca2} className="country-card">
                  <img src={country.flags.svg} alt={`${country.name.common} flag`} />
                  <div className="country-meta">
                    <h3>{country.name.common}</h3>
                    <p>{country.region} • {country.capital?.[0] || 'No capital'}</p>
                    <p>{country.population.toLocaleString()} people</p>
                  </div>
                  <button onClick={() => addToItinerary(country)}>Add to itinerary</button>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'itinerary' && (
          <section className="itinerary-panel">
            <div className="panel-header">
              <div>
                <h2>Itinerary Builder</h2>
                <p>Organize travel dates and activity ideas.</p>
              </div>
              <div className="stats-card light">
                <span>{itinerary.length}</span>
                <p>destinations planned</p>
              </div>
            </div>

            {itinerary.length === 0 ? (
              <div className="status-message">No destinations added yet. Add one from the search panel.</div>
            ) : (
              <ul className="itinerary-list">
                {itinerary.map((item, index) => (
                  <li key={item.destination} className="itinerary-card">
                    <img src={item.flag} alt={`${item.destination} flag`} />
                    <div className="itinerary-info">
                      <div className="itinerary-title">
                        <h3>{item.destination}</h3>
                        <input
                          type="date"
                          value={item.date}
                          onChange={(e) => updateItinerary(index, 'date', e.target.value)}
                        />
                      </div>
                      <div className="activities">
                        <h4>Activities</h4>
                        <ul>
                          {item.activities.map((act, i) => (
                            <li key={i}>{act}</li>
                          ))}
                        </ul>
                        <input
                          type="text"
                          placeholder="Add a new activity and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                              addActivity(index, e.currentTarget.value.trim())
                              e.currentTarget.value = ''
                            }
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {activeTab === 'budget' && (
          <section className="budget-panel">
            <div className="panel-header">
              <div>
                <h2>Budget Planner</h2>
                <p>Track travel costs with a clean planning layout.</p>
              </div>
              <div className="stats-card light">
                <span>${totalBudget.toFixed(2)}</span>
                <p>estimated spend</p>
              </div>
            </div>

            <div className="budget-form">
              <input
                type="text"
                placeholder="Budget item (Flight, Hotel, etc.)"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
              />
              <input
                type="number"
                placeholder="Cost"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
              />
              <button onClick={addBudgetItem}>Add Expense</button>
            </div>

            <div className="budget-list">
              {budgetItems.map((item, index) => (
                <div key={index} className="budget-item">
                  <span>{item.item}</span>
                  <strong>${item.cost.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
