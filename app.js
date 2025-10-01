// Configuration
const APP_CONFIG = {
  supabaseUrl: 'https://pygqvtumydxsnybvakkw.supabase.co',
  supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5Z3F2dHVteWR4c255YnZha2t3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTU0MDgsImV4cCI6MjA3NDgzMTQwOH0.gZEXn485fkwjdnedthefsEyhnHiEMO_ZvreS9meiZbg',
  golfApiKey: 'JL4HBGKKLZZSXLHGDYRSFUUVLI',
  golfApiUrl: 'https://api.golfcourseapi.com',
  defaultHoleData: Array.from({ length: 18 }, (_, i) => ({
    hole: i + 1,
    par: i < 4 || i > 13 ? 4 : (i === 4 || i === 14 ? 3 : 5),
    strokeIndex: i + 1
  }))
};

// Check if libraries are loaded
console.log('React available:', typeof React !== 'undefined');
console.log('ReactDOM available:', typeof ReactDOM !== 'undefined');
console.log('Supabase available:', typeof window.supabase !== 'undefined');

// Early error handling
if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
  document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Error: React libraries failed to load. Check your internet connection.</div>';
  throw new Error('React libraries not loaded');
}

if (typeof window.supabase === 'undefined') {
  document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Error: Supabase library failed to load. Check your internet connection.</div>';
  throw new Error('Supabase library not loaded');
}

// Initialize Supabase
let supabase;
try {
  supabase = window.supabase.createClient(APP_CONFIG.supabaseUrl, APP_CONFIG.supabaseKey);
  console.log('Supabase initialized');
} catch (error) {
  console.error('Supabase initialization error:', error);
  document.getElementById('root').innerHTML = '<div style="padding: 20px; color: red;">Error initializing Supabase. Check your configuration in app.js</div>';
  throw error;
}

// Icons Component
const Icons = {
  Trophy: ({ className, size = 24 }) => 
    React.createElement('svg', { className, width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      React.createElement('path', { d: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6' }),
      React.createElement('path', { d: 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18' }),
      React.createElement('path', { d: 'M4 22h16' }),
      React.createElement('path', { d: 'M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22' }),
      React.createElement('path', { d: 'M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22' }),
      React.createElement('path', { d: 'M18 2H6v7a6 6 0 0 0 12 0V2Z' })
    ),
  Users: ({ className, size = 24 }) =>
    React.createElement('svg', { className, width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      React.createElement('path', { d: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' }),
      React.createElement('circle', { cx: 9, cy: 7, r: 4 }),
      React.createElement('path', { d: 'M22 21v-2a4 4 0 0 0-3-3.87' }),
      React.createElement('path', { d: 'M16 3.13a4 4 0 0 1 0 7.75' })
    ),
  Plus: ({ className, size = 24 }) =>
    React.createElement('svg', { className, width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      React.createElement('line', { x1: 12, y1: 5, x2: 12, y2: 19 }),
      React.createElement('line', { x1: 5, y1: 12, x2: 19, y2: 12 })
    ),
  Edit: ({ className, size = 24 }) =>
    React.createElement('svg', { className, width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      React.createElement('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
      React.createElement('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
    ),
  Award: ({ className, size = 24 }) =>
    React.createElement('svg', { className, width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' },
      React.createElement('circle', { cx: 12, cy: 8, r: 7 }),
      React.createElement('polyline', { points: '8.21 13.89 7 23 12 20 17 23 15.79 13.88' })
    )
};

const { useState, useEffect, createElement: h } = React;

function LegsOpenTournament() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [tournaments, setTournaments] = useState([]);
  const [currentTournament, setCurrentTournament] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [tournamentPlayers, setTournamentPlayers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [scores, setScores] = useState({});
  const [allScores, setAllScores] = useState([]); // Store all scores for historical data
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [viewingScorecard, setViewingScorecard] = useState(null); // For viewing player's scorecard from tournament history
  const [newPlayer, setNewPlayer] = useState({ name: '', handicap: '', cdh: '', bio: '', photo_url: '' });
  const [showCreateTournament, setShowCreateTournament] = useState(false);
  const [editingCourse, setEditingCourse] = useState(false);
  const [editingTournament, setEditingTournament] = useState(false);
  const [courseHoles, setCourseHoles] = useState(APP_CONFIG.defaultHoleData);
  const [newTournament, setNewTournament] = useState({
    name: '',
    year: new Date().getFullYear(),
    course_name: '',
    slope_rating: 113,
    course_rating: 72,
    holes: APP_CONFIG.defaultHoleData,
    start_date: '',
    end_date: '',
    is_active: false,
    status: 'upcoming'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courseSearch, setCourseSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [availableTees, setAvailableTees] = useState([]);
  const [selectedTee, setSelectedTee] = useState(null);
  const [searchingCourses, setSearchingCourses] = useState(false);

useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []); // Run only once on mount

  // Save selected tournament ID to localStorage whenever it changes
  useEffect(() => {
    if (currentTournament?.id) {
      const savedId = localStorage.getItem('selectedTournamentId');
      // Only update localStorage if the ID actually changed
      if (savedId !== currentTournament.id) {
        localStorage.setItem('selectedTournamentId', currentTournament.id);
      }
    }
  }, [currentTournament?.id]); // Only track ID changes, not the whole object
  
  const selectSmartTournament = (tournaments) => {
    // Priority order for selecting the "current" tournament:
    // 1. Previously selected tournament from localStorage (if still exists)
    // 2. Active tournament (is_active = true)
    // 3. Most recent tournament with scores
    // 4. Newest tournament by year

    const savedTournamentId = localStorage.getItem('selectedTournamentId');

    // Try to restore previously selected tournament
    if (savedTournamentId) {
      const savedTournament = tournaments.find(t => t.id === savedTournamentId);
      if (savedTournament) return savedTournament;
    }

    // Find active tournament
    const activeTournament = tournaments.find(t => t.is_active === true);
    if (activeTournament) return activeTournament;

    // Find most recent tournament with scores (we'll check this later when scores load)
    // For now, just return the newest by year
    const sorted = [...tournaments].sort((a, b) => {
      // Sort by year descending, then by start_date descending
      if (b.year !== a.year) return b.year - a.year;
      if (b.start_date && a.start_date) return new Date(b.start_date) - new Date(a.start_date);
      return 0;
    });

    return sorted[0];
  };

  const loadData = async () => {
    try {
      const tournamentsRes = await supabase.from('tournaments').select('*');
      if (tournamentsRes.error) throw new Error(`Tournaments error: ${tournamentsRes.error.message}`);

      const playersRes = await supabase.from('players').select('*');
      if (playersRes.error) throw new Error(`Players error: ${playersRes.error.message}`);

      if (tournamentsRes.data) {
        const sorted = tournamentsRes.data.sort((a, b) => b.year - a.year);
        setTournaments(sorted);

        // Smart tournament selection - only run on initial load
        if (!currentTournament && sorted.length > 0) {
          const selectedTournament = selectSmartTournament(sorted);
          setCurrentTournament(selectedTournament);
          if (selectedTournament.holes) setCourseHoles(selectedTournament.holes);
        }
      }
      
      if (playersRes.data) {
        setAllPlayers(playersRes.data.sort((a, b) => a.name.localeCompare(b.name)));
      }

      // Load all scores for player history (always, not just for current tournament)
      const scoresRes = await supabase.from('scores').select('*');
      if (scoresRes.data) {
        setAllScores(scoresRes.data);
      }

      if (currentTournament) {
        if (currentTournament.holes) setCourseHoles(currentTournament.holes);

        const tPlayersRes = await supabase.from('tournament_players').select('*');
        const groupsRes = await supabase.from('groups').select('*');

        if (tPlayersRes.data && playersRes.data) {
          const filtered = tPlayersRes.data.filter(tp => tp.tournament_id === currentTournament.id);
          const playerIds = filtered.map(tp => tp.player_id);
          const players = playersRes.data.filter(p => playerIds.includes(p.id));
          setTournamentPlayers(players);
        }

        if (groupsRes.data) {
          const filtered = groupsRes.data.filter(g => g.tournament_id === currentTournament.id);
          setGroups(filtered.sort((a, b) => a.group_number - b.group_number));
        }

        // Filter scores for current tournament only
        if (scoresRes.data) {
          const filtered = scoresRes.data.filter(s => s.tournament_id === currentTournament.id);
          const scoresMap = {};
          filtered.forEach(score => {
            if (!scoresMap[score.player_id]) scoresMap[score.player_id] = {};
            scoresMap[score.player_id][score.hole] = score.strokes;
          });
          setScores(scoresMap);
        }
      }
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const createTournament = async () => {
    if (!newTournament.name || !newTournament.year) return;
    try {
      await supabase.from('tournaments').insert([newTournament]);
      await loadData();
      setShowCreateTournament(false);
      setNewTournament({
        name: '',
        year: new Date().getFullYear(),
        course_name: '',
        slope_rating: 113,
        course_rating: 72,
        holes: APP_CONFIG.defaultHoleData,
        start_date: '',
        end_date: '',
        is_active: false,
        status: 'upcoming'
      });
      // Reset course selection
      setCourseSearch('');
      setSearchResults([]);
      setSelectedCourse(null);
      setAvailableTees([]);
      setSelectedTee(null);
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert('Error creating tournament: ' + error.message);
    }
  };

  const searchCourses = async () => {
    if (!courseSearch.trim() || courseSearch.length < 3) {
      alert('Please enter at least 3 characters to search');
      return;
    }
    
    setSearchingCourses(true);
    try {
      const response = await fetch(`${APP_CONFIG.golfApiUrl}/v1/search?search_query=${encodeURIComponent(courseSearch)}`, {
        headers: {
          'Authorization': `Key ${APP_CONFIG.golfApiKey}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to search courses');
      }
      const data = await response.json();
      setSearchResults(data.courses || []);
      if (data.courses && data.courses.length === 0) {
        alert('No courses found. Try a different search term.');
      }
    } catch (error) {
      console.error('Error searching courses:', error);
      alert('Error searching courses: ' + error.message);
    } finally {
      setSearchingCourses(false);
    }
  };

  const selectCourse = async (course) => {
    console.log('selectCourse called with:', course);
    setSelectedCourse(course);
    setSearchResults([]);
    
    try {
      console.log('Fetching course details for ID:', course.id);
      const response = await fetch(`${APP_CONFIG.golfApiUrl}/v1/courses/${course.id}`, {
        headers: {
          'Authorization': `Key ${APP_CONFIG.golfApiKey}`
        }
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch course details');
      }
      const responseData = await response.json();
      console.log('Full response:', responseData);
      
      // The API returns data wrapped in a "course" object
      const data = responseData.course || responseData;
      console.log('Course data:', data);
      
      // Extract tees from male and female arrays
      const tees = [];
      
      // Add male tees
      if (data.tees && data.tees.male && Array.isArray(data.tees.male)) {
        console.log('Found male tees:', data.tees.male.length);
        data.tees.male.forEach((tee, index) => {
          console.log(`Male tee ${index}:`, tee.tee_name, 'has', tee.holes?.length, 'holes');
          if (tee.holes && tee.holes.length > 0) {
            tees.push({
              name: `${tee.tee_name} (Men's)`,
              tee_name: tee.tee_name,
              holes: tee.holes,
              slope_rating: tee.slope_rating || 113,
              course_rating: tee.course_rating || 72,
              par_total: tee.par_total || tee.holes.reduce((sum, h) => sum + (h.par || 0), 0),
              gender: 'male'
            });
          }
        });
      }
      
      // Add female tees
      if (data.tees && data.tees.female && Array.isArray(data.tees.female)) {
        console.log('Found female tees:', data.tees.female.length);
        data.tees.female.forEach((tee, index) => {
          console.log(`Female tee ${index}:`, tee.tee_name, 'has', tee.holes?.length, 'holes');
          if (tee.holes && tee.holes.length > 0) {
            tees.push({
              name: `${tee.tee_name} (Women's)`,
              tee_name: tee.tee_name,
              holes: tee.holes,
              slope_rating: tee.slope_rating || 113,
              course_rating: tee.course_rating || 72,
              par_total: tee.par_total || tee.holes.reduce((sum, h) => sum + (h.par || 0), 0),
              gender: 'female'
            });
          }
        });
      }
      
      console.log('Total tees extracted:', tees.length);
      console.log('Tees:', tees);
      
      if (tees.length === 0) {
        alert('No tee information found for this course. You can enter details manually.');
      }
      
      setAvailableTees(tees);
      setNewTournament({
        ...newTournament,
        course_name: `${data.club_name}${data.course_name && data.course_name !== data.club_name ? ' - ' + data.course_name : ''}`
      });
    } catch (error) {
      console.error('Error fetching course details:', error);
      alert('Error loading course details: ' + error.message);
    }
  };

  const selectTee = (tee) => {
    setSelectedTee(tee);
    
    console.log('Selected tee:', tee);
    console.log('Tee holes:', tee.holes);
    
    // Map the tee data to our hole format
    const holes = tee.holes.map((hole, index) => ({
      hole: index + 1,
      par: hole.par || 4,
      strokeIndex: hole.handicap || index + 1
    }));
    
    console.log('Mapped holes:', holes);
    
    const courseName = selectedCourse.club_name + (selectedCourse.course_name && selectedCourse.course_name !== selectedCourse.club_name ? ' - ' + selectedCourse.course_name : '');
    
    setNewTournament({
      ...newTournament,
      course_name: courseName,
      slope_rating: tee.slope_rating || 113,
      course_rating: tee.course_rating || 72,
      holes: holes
    });
    
    console.log('Tournament updated with:', {
      course_name: courseName,
      slope_rating: tee.slope_rating,
      course_rating: tee.course_rating,
      holes: holes
    });
  };

  const updateCourseDetails = async () => {
    if (!currentTournament) return;
    try {
      await supabase.from('tournaments').update({
        course_name: currentTournament.course_name,
        slope_rating: currentTournament.slope_rating,
        course_rating: currentTournament.course_rating,
        holes: courseHoles
      }).eq('id', currentTournament.id);
      await loadData();
      setEditingCourse(false);
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Error updating course: ' + error.message);
    }
  };

  const setTournamentActive = async (tournamentId) => {
    try {
      // Set this tournament as active (database trigger will deactivate others)
      await supabase.from('tournaments').update({
        is_active: true,
        status: 'active'
      }).eq('id', tournamentId);
      await loadData();
    } catch (error) {
      console.error('Error setting tournament active:', error);
      alert('Error setting tournament active: ' + error.message);
    }
  };

  const updateTournamentDetails = async (tournament) => {
    try {
      await supabase.from('tournaments').update({
        name: tournament.name,
        year: tournament.year,
        start_date: tournament.start_date,
        end_date: tournament.end_date,
        status: tournament.status
      }).eq('id', tournament.id);
      await loadData();
    } catch (error) {
      console.error('Error updating tournament:', error);
      alert('Error updating tournament: ' + error.message);
    }
  };

  const addPlayerToTournament = async (playerId) => {
    if (!currentTournament) return;
    try {
      await supabase.from('tournament_players').insert([{
        tournament_id: currentTournament.id,
        player_id: playerId,
        handicap: allPlayers.find(p => p.id === playerId)?.handicap || 0
      }]);
      await loadData();
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Error adding player: ' + error.message);
    }
  };

  const createNewPlayer = async () => {
    if (!newPlayer.name || !newPlayer.handicap) return;
    try {
      const { data, error } = await supabase.from('players').insert([{
        name: newPlayer.name,
        handicap: parseFloat(newPlayer.handicap),
        cdh_number: newPlayer.cdh,
        bio: newPlayer.bio,
        photo_url: newPlayer.photo_url
      }]).select();
      
      if (error) throw error;
      
      if (data && data[0] && currentTournament) await addPlayerToTournament(data[0].id);
      await loadData();
      setNewPlayer({ name: '', handicap: '', cdh: '', bio: '', photo_url: '' });
    } catch (error) {
      console.error('Error creating player:', error);
      alert('Error creating player: ' + error.message);
    }
  };

  const updatePlayerBio = async (player) => {
    try {
      await supabase.from('players').update({ 
        bio: player.bio, 
        photo_url: player.photo_url 
      }).eq('id', player.id);
      await loadData();
    } catch (error) {
      console.error('Error updating player:', error);
      alert('Error updating player: ' + error.message);
    }
  };

  const generateGroups = async () => {
    if (!currentTournament) return;
    try {
      const shuffled = [...tournamentPlayers].sort(() => Math.random() - 0.5);
      const newGroups = [];
      for (let i = 0; i < shuffled.length; i += 4) {
        const groupPlayers = shuffled.slice(i, i + 4);
        newGroups.push({
          tournament_id: currentTournament.id,
          group_number: Math.floor(i / 4) + 1,
          player_ids: groupPlayers.map(p => p.id),
          scorer_id: groupPlayers[0].id
        });
      }
      await supabase.from('groups').delete().eq('tournament_id', currentTournament.id);
      await supabase.from('groups').insert(newGroups);
      await loadData();
      setActiveTab('scoring');
    } catch (error) {
      console.error('Error generating groups:', error);
      alert('Error generating groups: ' + error.message);
    }
  };

  const updateScore = async (playerId, hole, strokes) => {
    if (!currentTournament || !strokes) return;
    try {
      await supabase.from('scores').upsert({
        tournament_id: currentTournament.id,
        player_id: playerId,
        hole: hole,
        strokes: parseInt(strokes)
      }, { onConflict: 'tournament_id,player_id,hole' });
      setScores({ 
        ...scores, 
        [playerId]: { ...scores[playerId], [hole]: parseInt(strokes) } 
      });
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const calculatePlayingHandicap = (handicap) => {
    if (!currentTournament) return 0;
    return Math.round(handicap * (currentTournament.slope_rating / 113));
  };

  const calculateStableford = (strokes, holeNumber, playingHandicap) => {
    const holeData = courseHoles.find(h => h.hole === holeNumber);
    if (!holeData) return 0;
    const strokesReceived = playingHandicap >= holeData.strokeIndex ? 
      Math.floor(playingHandicap / 18) + 1 : 
      Math.floor(playingHandicap / 18);
    const netScore = strokes - strokesReceived;
    return Math.max(0, 2 + (holeData.par - netScore));
  };

  const calculateResults = () => {
    if (!currentTournament) return { results: [], medalWinner: null, stablefordWinner: null };
    const results = tournamentPlayers.map(player => {
      const playerScores = scores[player.id] || {};
      const grossTotal = Object.values(playerScores).reduce((sum, s) => sum + s, 0);
      const playingHandicap = calculatePlayingHandicap(player.handicap);
      const netTotal = grossTotal - playingHandicap;
      let stablefordTotal = 0;
      for (let hole = 1; hole <= 18; hole++) {
        if (playerScores[hole]) stablefordTotal += calculateStableford(playerScores[hole], hole, playingHandicap);
      }
      return { ...player, grossTotal, netTotal, stablefordTotal, playingHandicap };
    }).filter(p => p.grossTotal > 0);
    results.sort((a, b) => a.netTotal - b.netTotal);
    const medalWinner = results[0];
    const stablefordWinner = results.filter(p => p.id !== medalWinner?.id).sort((a, b) => b.stablefordTotal - a.stablefordTotal)[0];
    return { results, medalWinner, stablefordWinner };
  };

  const getTotalPar = () => courseHoles.reduce((sum, h) => sum + h.par, 0);

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-600 text-white';
      case 'completed': return 'bg-gray-600 text-white';
      case 'upcoming': return 'bg-blue-600 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  const getStatusLabel = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Upcoming';
  };

  const getOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Render functions
  const renderTournamentsTab = () => {
    return h('div', { className: 'space-y-6' },
      h('div', { className: 'flex justify-between items-center' },
        h('h2', { className: 'text-3xl font-bold text-green-800' }, 'Tournaments'),
        h('button', {
          onClick: () => setShowCreateTournament(true),
          className: 'bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 flex items-center gap-2 font-semibold'
        }, h(Icons.Plus, { size: 20 }), 'Create Tournament')
      ),
      showCreateTournament && h('div', { className: 'bg-white p-6 rounded-lg classic-shadow' },
        h('h3', { className: 'text-xl font-bold mb-4 text-green-800' }, 'New Tournament'),
        
        // Tournament Name and Year
        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4 mb-4' },
          h('input', {
            type: 'text',
            placeholder: 'Tournament Name',
            value: newTournament.name,
            onChange: (e) => setNewTournament({ ...newTournament, name: e.target.value }),
            className: 'border border-gray-300 p-3 rounded-lg'
          }),
          h('input', {
            type: 'number',
            placeholder: 'Year',
            value: newTournament.year,
            onChange: (e) => setNewTournament({ ...newTournament, year: parseInt(e.target.value) }),
            className: 'border border-gray-300 p-3 rounded-lg'
          })
        ),

        // Tournament Dates and Status
        h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4 mb-4' },
          h('div', null,
            h('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Start Date'),
            h('input', {
              type: 'date',
              value: newTournament.start_date,
              onChange: (e) => setNewTournament({ ...newTournament, start_date: e.target.value }),
              className: 'w-full border border-gray-300 p-3 rounded-lg'
            })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'End Date'),
            h('input', {
              type: 'date',
              value: newTournament.end_date,
              onChange: (e) => setNewTournament({ ...newTournament, end_date: e.target.value }),
              className: 'w-full border border-gray-300 p-3 rounded-lg'
            })
          ),
          h('div', null,
            h('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Status'),
            h('select', {
              value: newTournament.status,
              onChange: (e) => setNewTournament({ ...newTournament, status: e.target.value }),
              className: 'w-full border border-gray-300 p-3 rounded-lg'
            },
              h('option', { value: 'upcoming' }, 'Upcoming'),
              h('option', { value: 'active' }, 'Active'),
              h('option', { value: 'completed' }, 'Completed')
            )
          )
        ),
        
        // Course Search Section
        h('div', { className: 'mb-4' },
          h('h4', { className: 'font-semibold mb-2 text-green-800' }, 'Search for Course'),
          h('div', { className: 'flex gap-2' },
            h('input', {
              type: 'text',
              placeholder: 'Search course name (e.g., St Andrews)',
              value: courseSearch,
              onChange: (e) => setCourseSearch(e.target.value),
              onKeyPress: (e) => e.key === 'Enter' && searchCourses(),
              className: 'flex-1 border border-gray-300 p-3 rounded-lg'
            }),
            h('button', {
              onClick: searchCourses,
              disabled: searchingCourses,
              className: 'bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400'
            }, searchingCourses ? 'Searching...' : 'Search')
          )
        ),
        
        // Search Results
        searchResults.length > 0 && h('div', { className: 'mb-4 border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto' },
          h('h4', { className: 'font-semibold mb-2 text-green-800' }, 'Search Results'),
          h('div', { className: 'space-y-2' },
            searchResults.map(course => h('div', {
              key: course.id,
              onClick: () => selectCourse(course),
              className: 'p-3 border border-gray-200 rounded hover:bg-green-50 cursor-pointer'
            },
              h('p', { className: 'font-semibold' }, course.club_name),
              course.course_name !== course.club_name && h('p', { className: 'text-sm text-gray-500' }, course.course_name),
              h('p', { className: 'text-sm text-gray-600' }, 
                course.location ? `${course.location.city || ''}, ${course.location.state || ''}, ${course.location.country || ''}` : ''
              )
            ))
          )
        ),
        
        // Selected Course
        selectedCourse && h('div', { className: 'mb-4 p-4 bg-green-50 border border-green-200 rounded-lg' },
          h('div', { className: 'flex justify-between items-start' },
            h('div', null,
              h('h4', { className: 'font-semibold text-green-800' }, 'Selected Course'),
              h('p', { className: 'font-bold' }, selectedCourse.club_name),
              selectedCourse.course_name !== selectedCourse.club_name && h('p', { className: 'text-sm text-gray-500' }, selectedCourse.course_name),
              h('p', { className: 'text-sm text-gray-600' }, 
                selectedCourse.location ? `${selectedCourse.location.city || ''}, ${selectedCourse.location.state || ''}, ${selectedCourse.location.country || ''}` : ''
              )
            ),
            h('button', {
              onClick: () => {
                setSelectedCourse(null);
                setAvailableTees([]);
                setSelectedTee(null);
              },
              className: 'text-red-600 hover:text-red-800'
            }, 'Clear')
          )
        ),
        
        // Available Tees
        availableTees.length > 0 && h('div', { className: 'mb-4' },
          h('h4', { className: 'font-semibold mb-2 text-green-800' }, 'Select Tees'),
          h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-3' },
            availableTees.map((tee, index) => h('div', {
              key: index,
              onClick: () => selectTee(tee),
              className: `p-4 border-2 rounded-lg cursor-pointer ${
                selectedTee === tee ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-green-400'
              }`
            },
              h('p', { className: 'font-bold' }, tee.name),
              h('p', { className: 'text-sm text-gray-600' }, `Par: ${tee.par_total}`),
              h('p', { className: 'text-sm text-gray-600' }, `Course Rating: ${tee.course_rating}`),
              h('p', { className: 'text-sm text-gray-600' }, `Slope: ${tee.slope_rating}`)
            ))
          )
        ),
        
        // Manual Entry (fallback)
        !selectedCourse && h('div', { className: 'mb-4' },
          h('h4', { className: 'font-semibold mb-2 text-green-800' }, 'Or Enter Manually'),
          h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
            h('input', {
              type: 'text',
              placeholder: 'Course Name',
              value: newTournament.course_name,
              onChange: (e) => setNewTournament({ ...newTournament, course_name: e.target.value }),
              className: 'border border-gray-300 p-3 rounded-lg'
            }),
            h('input', {
              type: 'number',
              placeholder: 'Slope Rating',
              value: newTournament.slope_rating,
              onChange: (e) => setNewTournament({ ...newTournament, slope_rating: parseInt(e.target.value) }),
              className: 'border border-gray-300 p-3 rounded-lg'
            }),
            h('input', {
              type: 'number',
              step: '0.1',
              placeholder: 'Course Rating',
              value: newTournament.course_rating,
              onChange: (e) => setNewTournament({ ...newTournament, course_rating: parseFloat(e.target.value) }),
              className: 'border border-gray-300 p-3 rounded-lg'
            })
          )
        ),
        
        // Action Buttons
        h('div', { className: 'flex gap-4 mt-4' },
          h('button', {
            onClick: createTournament,
            disabled: !newTournament.name || !newTournament.course_name,
            className: 'bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 font-semibold disabled:bg-gray-400'
          }, 'Create Tournament'),
          h('button', {
            onClick: () => {
              setShowCreateTournament(false);
              setCourseSearch('');
              setSearchResults([]);
              setSelectedCourse(null);
              setAvailableTees([]);
              setSelectedTee(null);
            },
            className: 'bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 font-semibold'
          }, 'Cancel')
        )
      ),
      h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
        tournaments.map(t => h('div', {
          key: t.id,
          onClick: () => setCurrentTournament(t),
          className: `bg-white p-6 rounded-lg classic-shadow hover-lift cursor-pointer ${currentTournament?.id === t.id ? 'ring-4 ring-green-500' : ''}`
        },
          h('div', { className: 'flex justify-between items-start mb-2' },
            h('h3', { className: 'text-xl font-bold text-green-800' }, t.name),
            h('span', { className: `px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(t.status || 'upcoming')}` },
              getStatusLabel(t.status || 'upcoming')
            )
          ),
          h('p', { className: 'text-gray-600' }, `Year: ${t.year}`),
          h('p', { className: 'text-gray-600' }, `Course: ${t.course_name || 'Not set'}`),
          (t.start_date || t.end_date) && h('p', { className: 'text-gray-500 text-sm mt-2' },
            t.start_date && t.end_date
              ? `${new Date(t.start_date).toLocaleDateString()} - ${new Date(t.end_date).toLocaleDateString()}`
              : t.start_date
                ? `Starts: ${new Date(t.start_date).toLocaleDateString()}`
                : `Ends: ${new Date(t.end_date).toLocaleDateString()}`
          ),
          t.is_active && h('div', { className: 'mt-3 pt-3 border-t border-green-200' },
            h('p', { className: 'text-green-700 font-semibold text-sm flex items-center gap-1' },
              h(Icons.Trophy, { size: 16 }),
              'Active Tournament'
            )
          ),
          !t.is_active && (t.status === 'upcoming' || t.status === 'active') && h('button', {
            onClick: (e) => {
              e.stopPropagation();
              setTournamentActive(t.id);
            },
            className: 'mt-3 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-semibold'
          }, 'Set as Active')
        ))
      )
    );
  };

  const renderCourseTab = () => {
    if (!currentTournament) {
      return h('div', { className: 'text-center text-gray-600 text-xl py-12' }, 'Select a tournament first');
    }
    return h('div', { className: 'space-y-6' },
      h('div', { className: 'flex justify-between items-center' },
        h('h2', { className: 'text-3xl font-bold text-green-800' }, 'Tournament & Course Details'),
        h('div', { className: 'flex gap-2' },
          h('button', {
            onClick: () => setEditingTournament(!editingTournament),
            className: 'bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold'
          }, h(Icons.Edit, { size: 20 }), editingTournament ? 'Cancel' : 'Edit Tournament'),
          h('button', {
            onClick: () => setEditingCourse(!editingCourse),
            className: 'bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 flex items-center gap-2 font-semibold'
          }, h(Icons.Edit, { size: 20 }), editingCourse ? 'Cancel' : 'Edit Course')
        )
      ),

      // Tournament Details Section
      h('div', { className: 'bg-white p-6 rounded-lg classic-shadow' },
        h('h3', { className: 'text-xl font-bold mb-4 text-green-800 flex items-center gap-2' },
          h(Icons.Trophy, { size: 24 }),
          'Tournament Details'
        ),
        editingTournament ? h('div', { className: 'space-y-4' },
          h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
            h('input', {
              type: 'text',
              placeholder: 'Tournament Name',
              value: currentTournament.name,
              onChange: (e) => setCurrentTournament({ ...currentTournament, name: e.target.value }),
              className: 'border border-gray-300 p-3 rounded-lg'
            }),
            h('input', {
              type: 'number',
              placeholder: 'Year',
              value: currentTournament.year,
              onChange: (e) => setCurrentTournament({ ...currentTournament, year: parseInt(e.target.value) }),
              className: 'border border-gray-300 p-3 rounded-lg'
            })
          ),
          h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
            h('div', null,
              h('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Start Date'),
              h('input', {
                type: 'date',
                value: currentTournament.start_date || '',
                onChange: (e) => setCurrentTournament({ ...currentTournament, start_date: e.target.value }),
                className: 'w-full border border-gray-300 p-3 rounded-lg'
              })
            ),
            h('div', null,
              h('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'End Date'),
              h('input', {
                type: 'date',
                value: currentTournament.end_date || '',
                onChange: (e) => setCurrentTournament({ ...currentTournament, end_date: e.target.value }),
                className: 'w-full border border-gray-300 p-3 rounded-lg'
              })
            ),
            h('div', null,
              h('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Status'),
              h('select', {
                value: currentTournament.status || 'upcoming',
                onChange: (e) => setCurrentTournament({ ...currentTournament, status: e.target.value }),
                className: 'w-full border border-gray-300 p-3 rounded-lg'
              },
                h('option', { value: 'upcoming' }, 'Upcoming'),
                h('option', { value: 'active' }, 'Active'),
                h('option', { value: 'completed' }, 'Completed')
              )
            )
          ),
          h('button', {
            onClick: () => {
              updateTournamentDetails(currentTournament);
              setEditingTournament(false);
            },
            className: 'bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold'
          }, 'Save Tournament Details')
        ) : h('div', null,
          h('div', { className: 'flex items-center justify-between mb-3' },
            h('h4', { className: 'text-2xl font-bold' }, currentTournament.name),
            h('span', { className: `px-3 py-1 rounded-full text-sm font-bold ${getStatusBadgeColor(currentTournament.status || 'upcoming')}` },
              getStatusLabel(currentTournament.status || 'upcoming')
            )
          ),
          h('p', { className: 'text-gray-600 mb-1' }, `Year: ${currentTournament.year}`),
          (currentTournament.start_date || currentTournament.end_date) && h('p', { className: 'text-gray-600 mb-1' },
            currentTournament.start_date && currentTournament.end_date
              ? `${new Date(currentTournament.start_date).toLocaleDateString()} - ${new Date(currentTournament.end_date).toLocaleDateString()}`
              : currentTournament.start_date
                ? `Starts: ${new Date(currentTournament.start_date).toLocaleDateString()}`
                : `Ends: ${new Date(currentTournament.end_date).toLocaleDateString()}`
          ),
          currentTournament.is_active && h('p', { className: 'text-green-700 font-semibold mt-2 flex items-center gap-1' },
            h(Icons.Trophy, { size: 16 }),
            'Active Tournament'
          )
        )
      ),
      h('div', { className: 'bg-white p-6 rounded-lg classic-shadow' },
        editingCourse ? h('div', { className: 'space-y-4' },
          h('input', {
            type: 'text',
            placeholder: 'Course Name',
            value: currentTournament.course_name || '',
            onChange: (e) => setCurrentTournament({ ...currentTournament, course_name: e.target.value }),
            className: 'w-full border border-gray-300 p-3 rounded-lg'
          }),
          h('div', { className: 'grid grid-cols-2 gap-4' },
            h('input', {
              type: 'number',
              placeholder: 'Slope Rating',
              value: currentTournament.slope_rating,
              onChange: (e) => setCurrentTournament({ ...currentTournament, slope_rating: parseInt(e.target.value) }),
              className: 'border border-gray-300 p-3 rounded-lg'
            }),
            h('input', {
              type: 'number',
              placeholder: 'Course Rating',
              value: currentTournament.course_rating,
              onChange: (e) => setCurrentTournament({ ...currentTournament, course_rating: parseFloat(e.target.value) }),
              className: 'border border-gray-300 p-3 rounded-lg'
            })
          ),
          h('button', {
            onClick: updateCourseDetails,
            className: 'bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 font-semibold'
          }, 'Save Details')
        ) : h('div', null,
          h('h3', { className: 'text-2xl font-bold mb-2' }, currentTournament.course_name || 'Course Name Not Set'),
          h('p', { className: 'text-gray-600' }, `Slope Rating: ${currentTournament.slope_rating}`),
          h('p', { className: 'text-gray-600' }, `Course Rating: ${currentTournament.course_rating}`),
          h('p', { className: 'text-gray-600 font-semibold mt-2' }, `Total Par: ${getTotalPar()}`)
        )
      ),
      h('div', { className: 'bg-white p-6 rounded-lg classic-shadow' },
        h('h3', { className: 'text-xl font-bold mb-4 text-green-800' }, 'Hole Details'),
        h('div', { className: 'overflow-x-auto' },
          h('table', { className: 'w-full' },
            h('thead', null,
              h('tr', { className: 'border-b-2 border-green-700' },
                h('th', { className: 'p-2 text-left' }, 'Hole'),
                h('th', { className: 'p-2 text-center' }, 'Par'),
                h('th', { className: 'p-2 text-center' }, 'Stroke Index')
              )
            ),
            h('tbody', null,
              courseHoles.map(hole => h('tr', {
                key: hole.hole,
                className: 'border-b border-gray-200'
              },
                h('td', { className: 'p-2 font-semibold' }, hole.hole),
                editingCourse ? h('td', { className: 'p-2' },
                  h('input', {
                    type: 'number',
                    value: hole.par,
                    onChange: (e) => {
                      const updated = [...courseHoles];
                      updated[hole.hole - 1].par = parseInt(e.target.value);
                      setCourseHoles(updated);
                    },
                    className: 'w-20 border border-gray-300 p-1 rounded text-center'
                  })
                ) : h('td', { className: 'p-2 text-center' }, hole.par),
                editingCourse ? h('td', { className: 'p-2' },
                  h('input', {
                    type: 'number',
                    value: hole.strokeIndex,
                    onChange: (e) => {
                      const updated = [...courseHoles];
                      updated[hole.hole - 1].strokeIndex = parseInt(e.target.value);
                      setCourseHoles(updated);
                    },
                    className: 'w-20 border border-gray-300 p-1 rounded text-center'
                  })
                ) : h('td', { className: 'p-2 text-center' }, hole.strokeIndex)
              ))
            )
          )
        )
      )
    );
  };

  const renderSetupTab = () => {
    if (!currentTournament) {
      return h('div', { className: 'text-center text-gray-600 text-xl py-12' }, 'Select a tournament first');
    }
    const availablePlayers = allPlayers.filter(p => !tournamentPlayers.find(tp => tp.id === p.id));
    
    return h('div', { className: 'space-y-6' },
      h('h2', { className: 'text-3xl font-bold text-green-800' }, 'Tournament Setup'),
      h('div', { className: 'bg-white p-6 rounded-lg classic-shadow' },
        h('h3', { className: 'text-xl font-bold mb-4 text-green-800' }, 'Add New Player'),
        h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-4' },
          h('input', {
            type: 'text',
            placeholder: 'Name',
            value: newPlayer.name,
            onChange: (e) => setNewPlayer({ ...newPlayer, name: e.target.value }),
            className: 'border border-gray-300 p-3 rounded-lg'
          }),
          h('input', {
            type: 'number',
            step: '0.1',
            placeholder: 'Handicap',
            value: newPlayer.handicap,
            onChange: (e) => setNewPlayer({ ...newPlayer, handicap: e.target.value }),
            className: 'border border-gray-300 p-3 rounded-lg'
          }),
          h('input', {
            type: 'text',
            placeholder: 'CDH Number',
            value: newPlayer.cdh,
            onChange: (e) => setNewPlayer({ ...newPlayer, cdh: e.target.value }),
            className: 'border border-gray-300 p-3 rounded-lg'
          })
        ),
        h('button', {
          onClick: createNewPlayer,
          className: 'mt-4 bg-green-700 text-white px-6 py-2 rounded-lg hover:bg-green-800 font-semibold'
        }, 'Add Player')
      ),
      h('div', { className: 'bg-white p-6 rounded-lg classic-shadow' },
        h('h3', { className: 'text-xl font-bold mb-4 text-green-800' }, 'Tournament Players'),
        tournamentPlayers.length === 0 ? h('p', { className: 'text-gray-500 text-center py-4' }, 'No players added yet') :
        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          tournamentPlayers.map(p => h('div', {
            key: p.id,
            className: 'border border-gray-300 p-4 rounded-lg'
          },
            h('p', { className: 'font-bold text-lg' }, p.name),
            h('p', { className: 'text-gray-600' }, `Handicap: ${p.handicap}`)
          ))
        )
      ),
      availablePlayers.length > 0 && h('div', { className: 'bg-white p-6 rounded-lg classic-shadow' },
        h('h3', { className: 'text-xl font-bold mb-4 text-green-800' }, 'Add Existing Players'),
        h('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          availablePlayers.map(p => h('div', {
            key: p.id,
            className: 'border border-gray-300 p-4 rounded-lg flex justify-between items-center'
          },
            h('div', null,
              h('p', { className: 'font-bold' }, p.name),
              h('p', { className: 'text-gray-600 text-sm' }, `Handicap: ${p.handicap}`)
            ),
            h('button', {
              onClick: () => addPlayerToTournament(p.id),
              className: 'bg-green-700 text-white px-4 py-2 rounded hover:bg-green-800'
            }, 'Add')
          ))
        )
      ),
      tournamentPlayers.length >= 4 && h('div', { className: 'bg-white p-6 rounded-lg classic-shadow' },
        h('button', {
          onClick: generateGroups,
          className: 'w-full bg-yellow-500 text-white px-6 py-4 rounded-lg hover:bg-yellow-600 font-bold text-lg'
        }, 'Generate Groups & Start Tournament')
      )
    );
  };

  const renderScoringTab = () => {
    if (!currentTournament) {
      return h('div', { className: 'text-center text-gray-600 text-xl py-12' }, 'Select a tournament first');
    }
    if (groups.length === 0) {
      return h('div', { className: 'text-center text-gray-600 text-xl py-12' }, 'No groups created yet. Go to Setup tab to generate groups.');
    }

    return h('div', { className: 'space-y-6' },
      h('h2', { className: 'text-3xl font-bold text-green-800 mb-4' }, 'Live Scoring'),
      h('div', { className: 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-6' },
        groups.map(group => h('button', {
          key: group.id,
          onClick: () => setSelectedGroup(group),
          className: `p-4 rounded-lg font-bold ${selectedGroup?.id === group.id ? 'bg-green-700 text-white' : 'bg-white text-green-800'} classic-shadow hover-lift`
        }, `Group ${group.group_number}`))
      ),
      selectedGroup && h('div', { className: 'bg-white p-6 rounded-lg classic-shadow' },
        h('h3', { className: 'text-xl font-bold mb-4 text-green-800' }, `Group ${selectedGroup.group_number}`),
        h('div', { className: 'space-y-4' },
          selectedGroup.player_ids.map(playerId => {
            const player = allPlayers.find(p => p.id === playerId);
            if (!player) return null;
            const playerScores = scores[playerId] || {};
            return h('div', {
              key: playerId,
              className: 'border-b border-gray-200 pb-4'
            },
              h('div', { className: 'flex justify-between items-center mb-2' },
                h('h4', { className: 'font-bold text-lg' }, player.name),
                h('span', { className: 'text-gray-600' }, `HCP: ${player.handicap}`)
              ),
              h('div', { className: 'grid grid-cols-6 md:grid-cols-9 gap-2' },
                Array.from({ length: 18 }, (_, i) => i + 1).map(hole => {
                  const holeData = courseHoles.find(h => h.hole === hole);
                  return h('div', { key: hole, className: 'flex flex-col' },
                    h('label', { className: 'text-xs text-gray-500 text-center' }, `${hole} (${holeData?.par})`),
                    h('input', {
                      type: 'number',
                      value: playerScores[hole] || '',
                      onChange: (e) => updateScore(playerId, hole, e.target.value),
                      className: 'border border-gray-300 p-2 rounded text-center',
                      placeholder: '-'
                    })
                  );
                })
              )
            );
          })
        )
      )
    );
  };

  const renderLeaderboardTab = () => {
    if (!currentTournament) {
      return h('div', { className: 'text-center text-gray-600 text-xl py-12' }, 'Select a tournament first');
    }
    const { results, medalWinner, stablefordWinner } = calculateResults();
    
    return h('div', { className: 'space-y-6' },
      h('h2', { className: 'text-3xl font-bold text-green-800 mb-4' }, 'Leaderboard'),
      
      medalWinner && h('div', { className: 'bg-gradient-to-r from-yellow-400 to-yellow-600 p-6 rounded-lg classic-shadow text-white' },
        h('div', { className: 'flex items-center gap-3 mb-2' },
          h(Icons.Trophy, { size: 32 }),
          h('h3', { className: 'text-2xl font-bold' }, 'Medal Winner')
        ),
        h('p', { className: 'text-3xl font-bold' }, medalWinner.name),
        h('p', { className: 'text-xl' }, `Net Score: ${medalWinner.netTotal} (Gross: ${medalWinner.grossTotal})`)
      ),
      
      stablefordWinner && h('div', { className: 'bg-gradient-to-r from-green-500 to-green-700 p-6 rounded-lg classic-shadow text-white' },
        h('div', { className: 'flex items-center gap-3 mb-2' },
          h(Icons.Award, { size: 32 }),
          h('h3', { className: 'text-2xl font-bold' }, 'Stableford Winner')
        ),
        h('p', { className: 'text-3xl font-bold' }, stablefordWinner.name),
        h('p', { className: 'text-xl' }, `Points: ${stablefordWinner.stablefordTotal}`)
      ),
      
      results.length === 0 ? h('div', { className: 'bg-white p-8 rounded-lg classic-shadow text-center text-gray-500' },
        h('p', { className: 'text-xl' }, 'No scores entered yet')
      ) :
      h('div', { className: 'bg-white rounded-lg classic-shadow overflow-hidden' },
        h('div', { className: 'overflow-x-auto' },
          h('table', { className: 'w-full' },
            h('thead', { className: 'bg-green-700 text-white' },
              h('tr', null,
                h('th', { className: 'p-3 text-left' }, 'Position'),
                h('th', { className: 'p-3 text-left' }, 'Player'),
                h('th', { className: 'p-3 text-center' }, 'HCP'),
                h('th', { className: 'p-3 text-center' }, 'Playing HCP'),
                h('th', { className: 'p-3 text-center' }, 'Gross'),
                h('th', { className: 'p-3 text-center' }, 'Net'),
                h('th', { className: 'p-3 text-center' }, 'Stableford')
              )
            ),
            h('tbody', null,
              results.map((player, index) => h('tr', {
                key: player.id,
                className: 'border-b border-gray-200 hover:bg-gray-50'
              },
                h('td', { className: 'p-3 font-bold' }, index + 1),
                h('td', { className: 'p-3' }, player.name),
                h('td', { className: 'p-3 text-center' }, player.handicap.toFixed(1)),
                h('td', { className: 'p-3 text-center' }, player.playingHandicap),
                h('td', { className: 'p-3 text-center' }, player.grossTotal),
                h('td', { className: 'p-3 text-center font-bold' }, player.netTotal),
                h('td', { className: 'p-3 text-center' }, player.stablefordTotal)
              ))
            )
          )
        )
      )
    );
  };

  const renderPlayersTab = () => {
    return h('div', { className: 'space-y-6' },
      h('h2', { className: 'text-3xl font-bold text-green-800 mb-4' }, 'Player Profiles'),
      allPlayers.length === 0 ? h('div', { className: 'text-center text-gray-500 text-xl py-12' }, 'No players yet. Go to Setup to add players.') :
      h('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
        allPlayers.map(player => h('div', {
          key: player.id,
          onClick: () => setSelectedPlayer(player),
          className: 'bg-white p-6 rounded-lg classic-shadow hover-lift cursor-pointer'
        },
          player.photo_url ? h('img', {
            src: player.photo_url,
            alt: player.name,
            className: 'w-24 h-24 rounded-full mx-auto mb-4 object-cover'
          }) : h('div', {
            className: 'w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center'
          }, h('span', { className: 'text-3xl text-gray-400' }, player.name.charAt(0))),
          h('h3', { className: 'text-xl font-bold text-center text-green-800' }, player.name),
          h('p', { className: 'text-center text-gray-600' }, `Handicap: ${player.handicap}`),
          player.cdh_number && h('p', { className: 'text-center text-gray-500 text-sm' }, `CDH: ${player.cdh_number}`),
          player.bio && h('p', { className: 'text-center text-gray-600 text-sm mt-2 line-clamp-2' }, player.bio)
        ))
      ),
      
      selectedPlayer && (() => {
        // Calculate player's tournament history
        const playerTournaments = tournaments.map(tournament => {
          // Get player's scores for THIS specific tournament (not current tournament)
          const tournamentScores = allScores.filter(s =>
            s.tournament_id === tournament.id && s.player_id === selectedPlayer.id
          );

          // Build scores map for this tournament
          const playerScores = {};
          tournamentScores.forEach(score => {
            playerScores[score.hole] = score.strokes;
          });

          const grossTotal = Object.values(playerScores).reduce((sum, s) => sum + s, 0);
          const playingHandicap = calculatePlayingHandicap(selectedPlayer.handicap);
          const netTotal = grossTotal - playingHandicap;

          let stablefordTotal = 0;
          const tournamentHoles = tournament.holes || APP_CONFIG.defaultHoleData;
          for (let hole = 1; hole <= 18; hole++) {
            if (playerScores[hole]) {
              const holeData = tournamentHoles.find(h => h.hole === hole);
              if (holeData) {
                const strokesReceived = playingHandicap >= holeData.strokeIndex ?
                  Math.floor(playingHandicap / 18) + 1 :
                  Math.floor(playingHandicap / 18);
                const netScore = playerScores[hole] - strokesReceived;
                stablefordTotal += Math.max(0, 2 + (holeData.par - netScore));
              }
            }
          }

          // Calculate all players' results for this tournament to determine position
          const allTournamentPlayerScores = allPlayers.map(p => {
            const pScores = allScores.filter(s =>
              s.tournament_id === tournament.id && s.player_id === p.id
            );
            const pScoresMap = {};
            pScores.forEach(score => {
              pScoresMap[score.hole] = score.strokes;
            });
            const pGross = Object.values(pScoresMap).reduce((sum, s) => sum + s, 0);
            const pHandicap = calculatePlayingHandicap(p.handicap);
            const pNet = pGross - pHandicap;
            return { playerId: p.id, netTotal: pNet, grossTotal: pGross };
          }).filter(p => p.grossTotal > 0);

          // Sort by net score to find position
          const sortedResults = allTournamentPlayerScores.sort((a, b) => a.netTotal - b.netTotal);
          const position = sortedResults.findIndex(p => p.playerId === selectedPlayer.id) + 1;
          const totalPlayers = sortedResults.length;

          return {
            tournament,
            grossTotal,
            netTotal,
            stablefordTotal,
            playerScores,
            hasScores: grossTotal > 0,
            position,
            totalPlayers
          };
        }).filter(pt => pt.hasScores); // Only show tournaments where player has scores

        const handleImageUpload = (e) => {
          const file = e.target.files[0];
          if (!file) return;
          
          // Check file size (max 5MB)
          if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            return;
          }
          
          // Check file type
          if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            return;
          }
          
          // Create a FileReader to convert to base64
          const reader = new FileReader();
          reader.onload = (event) => {
            setSelectedPlayer({ ...selectedPlayer, photo_url: event.target.result });
          };
          reader.readAsDataURL(file);
        };

        return h('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50', onClick: () => setSelectedPlayer(null) },
          h('div', { 
            className: 'bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto',
            onClick: (e) => e.stopPropagation()
          },
            h('div', { className: 'flex justify-between items-start mb-6' },
              h('h3', { className: 'text-3xl font-bold text-green-800' }, selectedPlayer.name),
              h('button', {
                onClick: () => setSelectedPlayer(null),
                className: 'text-gray-500 hover:text-gray-700 text-3xl leading-none'
              }, '×')
            ),
            
            // Player Info Section
            h('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-6' },
              // Left: Photo Upload
              h('div', { className: 'space-y-4' },
                selectedPlayer.photo_url ? h('img', {
                  src: selectedPlayer.photo_url,
                  alt: selectedPlayer.name,
                  className: 'w-full aspect-square rounded-lg object-cover'
                }) : h('div', {
                  className: 'w-full aspect-square rounded-lg bg-gray-200 flex items-center justify-center'
                }, h('span', { className: 'text-6xl text-gray-400' }, selectedPlayer.name.charAt(0))),
                
                h('div', { className: 'space-y-2' },
                  h('label', {
                    className: 'block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer font-semibold'
                  },
                    'Upload Photo',
                    h('input', {
                      type: 'file',
                      accept: 'image/*',
                      onChange: handleImageUpload,
                      className: 'hidden'
                    })
                  ),
                  h('input', {
                    type: 'text',
                    placeholder: 'Or paste image URL',
                    value: selectedPlayer.photo_url || '',
                    onChange: (e) => setSelectedPlayer({ ...selectedPlayer, photo_url: e.target.value }),
                    className: 'w-full border border-gray-300 p-2 rounded-lg text-sm'
                  })
                )
              ),
              
              // Right: Player Details
              h('div', { className: 'md:col-span-2 space-y-4' },
                h('div', { className: 'grid grid-cols-2 gap-4' },
                  h('div', null,
                    h('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Handicap'),
                    h('p', { className: 'text-2xl font-bold text-green-800' }, selectedPlayer.handicap)
                  ),
                  h('div', null,
                    h('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'CDH Number'),
                    h('p', { className: 'text-lg' }, selectedPlayer.cdh_number || 'Not set')
                  )
                ),
                h('div', null,
                  h('label', { className: 'block text-sm font-semibold text-gray-700 mb-1' }, 'Bio'),
                  h('textarea', {
                    placeholder: 'Add a bio...',
                    value: selectedPlayer.bio || '',
                    onChange: (e) => setSelectedPlayer({ ...selectedPlayer, bio: e.target.value }),
                    className: 'w-full border border-gray-300 p-3 rounded-lg h-32'
                  })
                )
              )
            ),
            
            // Tournament History Section
            h('div', { className: 'mb-6' },
              h('h4', { className: 'text-2xl font-bold text-green-800 mb-4 flex items-center gap-2' },
                h(Icons.Trophy, { size: 24 }),
                'Tournament History'
              ),
              playerTournaments.length === 0 ? 
                h('p', { className: 'text-gray-500 text-center py-8' }, 'No tournament history yet') :
                h('div', { className: 'space-y-3' },
                  playerTournaments.map(({ tournament, grossTotal, netTotal, stablefordTotal, hasScores, position, totalPlayers, playerScores }) =>
                    h('div', {
                      key: tournament.id,
                      className: 'border border-gray-300 rounded-lg p-4 hover:bg-gray-50'
                    },
                      h('div', { className: 'mb-2' },
                        h('h5', { className: 'font-bold text-lg text-green-800' }, tournament.name),
                        h('p', { className: 'text-sm text-gray-600' }, `${tournament.year} - ${tournament.course_name}`),
                        position > 0 && h('p', { className: 'text-sm font-semibold text-blue-700 mt-1' },
                          `Finished ${getOrdinal(position)} of ${totalPlayers} players`
                        )
                      ),
                      hasScores && h('div', { className: 'grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-200' },
                        h('div', { className: 'text-center' },
                          h('p', { className: 'text-xs text-gray-500' }, 'Gross Score'),
                          h('p', { className: 'text-lg font-bold text-gray-700' }, grossTotal)
                        ),
                        h('div', { className: 'text-center' },
                          h('p', { className: 'text-xs text-gray-500' }, 'Net Score'),
                          h('p', { className: 'text-lg font-bold text-green-700' }, netTotal)
                        ),
                        h('div', { className: 'text-center' },
                          h('p', { className: 'text-xs text-gray-500' }, 'Stableford'),
                          h('p', { className: 'text-lg font-bold text-blue-700' }, stablefordTotal)
                        )
                      ),
                      hasScores && h('button', {
                        onClick: () => setViewingScorecard({ tournament, playerScores, player: selectedPlayer }),
                        className: 'mt-3 w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2'
                      },
                        h(Icons.Edit, { size: 16 }),
                        'View Scorecard'
                      ),
                      !hasScores && h('p', { className: 'text-sm text-gray-400 italic mt-3' }, 'No scores recorded')
                    )
                  )
                )
            ),
            
            // Save Button
            h('div', { className: 'flex gap-4' },
              h('button', {
                onClick: () => {
                  updatePlayerBio(selectedPlayer);
                  setSelectedPlayer(null);
                },
                className: 'flex-1 bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 font-semibold'
              }, 'Save Changes'),
              h('button', {
                onClick: () => setSelectedPlayer(null),
                className: 'bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-semibold'
              }, 'Cancel')
            )
          )
        );
      })(),

      // Scorecard Modal
      viewingScorecard && h('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50',
        onClick: () => setViewingScorecard(null)
      },
        h('div', {
          className: 'bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto',
          onClick: (e) => e.stopPropagation()
        },
          h('div', { className: 'flex justify-between items-start mb-6' },
            h('div', null,
              h('h3', { className: 'text-3xl font-bold text-green-800' }, `${viewingScorecard.player.name}'s Scorecard`),
              h('p', { className: 'text-gray-600 mt-1' }, `${viewingScorecard.tournament.name} - ${viewingScorecard.tournament.year}`)
            ),
            h('button', {
              onClick: () => setViewingScorecard(null),
              className: 'text-gray-500 hover:text-gray-700 text-3xl leading-none'
            }, '×')
          ),

          // Scorecard Table
          h('div', { className: 'overflow-x-auto' },
            h('table', { className: 'w-full border-collapse' },
              h('thead', null,
                h('tr', { className: 'bg-green-700 text-white' },
                  h('th', { className: 'p-3 text-left border border-green-600' }, 'Hole'),
                  h('th', { className: 'p-3 text-center border border-green-600' }, 'Par'),
                  h('th', { className: 'p-3 text-center border border-green-600' }, 'SI'),
                  h('th', { className: 'p-3 text-center border border-green-600' }, 'Score'),
                  h('th', { className: 'p-3 text-center border border-green-600' }, 'Points')
                )
              ),
              h('tbody', null,
                Array.from({ length: 18 }, (_, i) => i + 1).map(hole => {
                  const tournamentHoles = viewingScorecard.tournament.holes || APP_CONFIG.defaultHoleData;
                  const holeData = tournamentHoles.find(h => h.hole === hole);
                  const score = viewingScorecard.playerScores[hole];
                  const playingHandicap = calculatePlayingHandicap(viewingScorecard.player.handicap);

                  let points = 0;
                  if (score && holeData) {
                    const strokesReceived = playingHandicap >= holeData.strokeIndex ?
                      Math.floor(playingHandicap / 18) + 1 :
                      Math.floor(playingHandicap / 18);
                    const netScore = score - strokesReceived;
                    points = Math.max(0, 2 + (holeData.par - netScore));
                  }

                  const par = holeData?.par || 4;
                  const diff = score ? score - par : 0;
                  const bgColor = !score ? '' :
                    diff <= -2 ? 'bg-yellow-100' :
                    diff === -1 ? 'bg-blue-100' :
                    diff === 0 ? 'bg-green-100' :
                    diff === 1 ? 'bg-orange-100' :
                    'bg-red-100';

                  return h('tr', {
                    key: hole,
                    className: `${bgColor} ${hole === 9 ? 'border-b-4 border-green-700' : 'border-b border-gray-200'}`
                  },
                    h('td', { className: 'p-3 font-bold border border-gray-300' }, hole),
                    h('td', { className: 'p-3 text-center border border-gray-300' }, holeData?.par || 4),
                    h('td', { className: 'p-3 text-center border border-gray-300' }, holeData?.strokeIndex || hole),
                    h('td', { className: 'p-3 text-center font-bold border border-gray-300' }, score || '-'),
                    h('td', { className: 'p-3 text-center font-bold border border-gray-300' }, score ? points : '-')
                  );
                }),
                // Totals row
                h('tr', { className: 'bg-green-700 text-white font-bold' },
                  h('td', { className: 'p-3 border border-green-600' }, 'Total'),
                  h('td', { className: 'p-3 text-center border border-green-600' },
                    (viewingScorecard.tournament.holes || APP_CONFIG.defaultHoleData).reduce((sum, h) => sum + h.par, 0)
                  ),
                  h('td', { className: 'p-3 border border-green-600' }, ''),
                  h('td', { className: 'p-3 text-center border border-green-600' },
                    Object.values(viewingScorecard.playerScores).reduce((sum, s) => sum + s, 0) || '-'
                  ),
                  h('td', { className: 'p-3 text-center border border-green-600' },
                    (() => {
                      let total = 0;
                      const tournamentHoles = viewingScorecard.tournament.holes || APP_CONFIG.defaultHoleData;
                      const playingHandicap = calculatePlayingHandicap(viewingScorecard.player.handicap);
                      for (let hole = 1; hole <= 18; hole++) {
                        const score = viewingScorecard.playerScores[hole];
                        if (score) {
                          const holeData = tournamentHoles.find(h => h.hole === hole);
                          if (holeData) {
                            const strokesReceived = playingHandicap >= holeData.strokeIndex ?
                              Math.floor(playingHandicap / 18) + 1 :
                              Math.floor(playingHandicap / 18);
                            const netScore = score - strokesReceived;
                            total += Math.max(0, 2 + (holeData.par - netScore));
                          }
                        }
                      }
                      return total;
                    })()
                  )
                )
              )
            )
          ),

          // Close button
          h('div', { className: 'mt-6 flex justify-end' },
            h('button', {
              onClick: () => setViewingScorecard(null),
              className: 'bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 font-semibold'
            }, 'Close')
          )
        )
      )
    );
  };

  const renderHistoryTab = () => {
    return h('div', { className: 'space-y-6' },
      h('h2', { className: 'text-3xl font-bold text-green-800 mb-4' }, 'Tournament History'),
      tournaments.length === 0 ? h('div', { className: 'text-center text-gray-500 text-xl py-12' }, 'No tournaments yet') :
      h('div', { className: 'space-y-4' },
        tournaments.map(tournament => {
          return h('div', {
            key: tournament.id,
            className: 'bg-white p-6 rounded-lg classic-shadow'
          },
            h('div', { className: 'flex justify-between items-center mb-4' },
              h('div', null,
                h('h3', { className: 'text-2xl font-bold text-green-800' }, tournament.name),
                h('p', { className: 'text-gray-600' }, `${tournament.year} - ${tournament.course_name || 'Course TBD'}`)
              ),
              h('button', {
                onClick: () => {
                  setCurrentTournament(tournament);
                  setActiveTab('leaderboard');
                },
                className: 'bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800'
              }, 'View Results')
            )
          );
        })
      )
    );
  };

  if (loading) {
    return h('div', { className: 'min-h-screen hero-pattern flex items-center justify-center' },
      h('div', { className: 'text-white text-xl font-light' }, 'Loading The Legs Open...')
    );
  }

  if (error) {
    return h('div', { className: 'min-h-screen bg-gray-50 flex items-center justify-center p-4' },
      h('div', { className: 'bg-white p-8 rounded-lg shadow-lg max-w-2xl' },
        h('h2', { className: 'text-2xl font-bold text-red-600 mb-4' }, 'Error Loading App'),
        h('p', { className: 'text-gray-700 mb-4' }, error),
        h('div', { className: 'bg-gray-100 p-4 rounded' },
          h('p', { className: 'font-semibold mb-2' }, 'Troubleshooting Steps:'),
          h('ol', { className: 'list-decimal list-inside space-y-2 text-sm' },
            h('li', null, 'Check that you\'ve updated the Supabase URL and API key in app.js'),
            h('li', null, 'Verify your Supabase tables are created (tournaments, players, etc.)'),
            h('li', null, 'Check the browser console (F12) for detailed error messages'),
            h('li', null, 'Ensure RLS policies are set up correctly in Supabase')
          )
        ),
        h('button', {
          onClick: () => window.location.reload(),
          className: 'mt-4 bg-green-700 text-white px-6 py-2 rounded hover:bg-green-800'
        }, 'Retry')
      )
    );
  }

  return h('div', { className: 'min-h-screen bg-gray-50' },
    h('header', { className: 'hero-pattern text-white sticky top-0 z-50 classic-shadow' },
      h('div', { className: 'max-w-7xl mx-auto px-4 py-8' },
        h('div', { className: 'text-center' },
          h('div', { className: 'flex items-center justify-center gap-3 mb-2' },
            h(Icons.Trophy, { className: 'text-yellow-400', size: 48 }),
            h('h1', { className: 'text-5xl md:text-6xl font-bold tracking-tight' }, 'THE LEGS OPEN')
          ),
          h('p', { className: 'text-xl font-light text-gray-200 tracking-wide' },
            currentTournament ? `${currentTournament.name} - ${currentTournament.year}` : 'Championship Series'
          )
        )
      ),
      h('nav', { className: 'bg-white/10 backdrop-blur-sm border-t border-white/20' },
        h('div', { className: 'max-w-7xl mx-auto px-4' },
          h('div', { className: 'flex justify-center gap-1 overflow-x-auto' },
            ['tournaments', 'course', 'setup', 'scoring', 'leaderboard', 'players', 'history'].map(tab =>
              h('button', {
                key: tab,
                onClick: () => setActiveTab(tab),
                className: `px-6 py-4 font-semibold uppercase text-sm tracking-wider transition-all whitespace-nowrap ${
                  activeTab === tab ? 'bg-white text-green-800 border-b-4 border-yellow-500' : 'text-white hover:bg-white/20'
                }`
              }, tab)
            )
          )
        )
      )
    ),
    h('main', { className: 'max-w-7xl mx-auto px-4 py-8' },
      activeTab === 'tournaments' && renderTournamentsTab(),
      activeTab === 'course' && renderCourseTab(),
      activeTab === 'setup' && renderSetupTab(),
      activeTab === 'scoring' && renderScoringTab(),
      activeTab === 'leaderboard' && renderLeaderboardTab(),
      activeTab === 'players' && renderPlayersTab(),
      activeTab === 'history' && renderHistoryTab()
    )
  );
}

// Initialize app
try {
  console.log('Initializing React app...');
  const { createRoot } = ReactDOM;
  const root = createRoot(document.getElementById('root'));
  root.render(h(LegsOpenTournament));
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
  document.getElementById('root').innerHTML = `<div style="padding: 20px; color: red;">Error rendering app: ${error.message}</div>`;
}
