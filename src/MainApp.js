import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import './App.css';
import Auth from './components/Auth';
import MyAreaReport from './components/MyAreaReport';
import TangailDailyReport from './components/TangailDailyReport';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import DivisionSummary from './components/DivisionSummary';
import AreaWiseSummary from './components/AreaWiseSummary';
import DailyComparison from './components/DailyComparison';
import OverdueStatistics from './components/OverdueStatistics';
import AnalyticsSection from './components/AnalyticsSection';
import { sendUploadNotification } from './utils/telegram';
import { saveTodayData, saveTangailPlazaData } from './utils/supabase';
import { supabase } from './config/supabaseClient';

function App() {
  const [user, setUser] = useState(null);
  const [userArea, setUserArea] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [divisionData, setDivisionData] = useState([]);
  const [areaWiseData, setAreaWiseData] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedArea, setSelectedArea] = useState('');
  const [loading, setLoading] = useState(false);
  const statisticsRef = React.useRef(null);
  const isLoadingProfile = React.useRef(false);

  // Check authentication status
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        // Check cache immediately before any async calls
        const cachedUserId = localStorage.getItem('cachedUserId');
        const cachedArea = cachedUserId ? localStorage.getItem(`userArea_${cachedUserId}`) : null;
        
        // If we have cache, show it immediately
        if (cachedUserId && cachedArea) {
          // Set loading to false immediately for instant display
          setAuthLoading(false);
          
          // Now get the actual session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (mounted && session?.user) {
            setUser(session.user);
            setUserArea(cachedArea);
            // Verify in background
            verifyUserProfile(session.user, cachedArea);
          } else {
            // Session expired, clear cache and show auth
            localStorage.removeItem('cachedUserId');
            localStorage.removeItem(`userArea_${cachedUserId}`);
            setAuthLoading(false);
          }
        } else {
          // No cache, need to check session
          const { data: { session } } = await supabase.auth.getSession();
          
          if (mounted) {
            if (session?.user) {
              const userArea = localStorage.getItem(`userArea_${session.user.id}`);
              if (userArea) {
                setUser(session.user);
                setUserArea(userArea);
                localStorage.setItem('cachedUserId', session.user.id);
                setAuthLoading(false);
                verifyUserProfile(session.user, userArea);
              } else {
                await loadUserProfile(session.user);
              }
            } else {
              setAuthLoading(false);
            }
          }
        }
      } catch (error) {
        console.error('Error checking user:', error);
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        const cachedArea = localStorage.getItem(`userArea_${session.user.id}`);
        if (cachedArea) {
          setUser(session.user);
          setUserArea(cachedArea);
          localStorage.setItem('cachedUserId', session.user.id);
          setAuthLoading(false);
        } else {
          await loadUserProfile(session.user);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserArea('');
        const cachedUserId = localStorage.getItem('cachedUserId');
        if (cachedUserId) {
          localStorage.removeItem('cachedUserId');
          localStorage.removeItem(`userArea_${cachedUserId}`);
        }
      }
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyUserProfile = async (authUser, cachedArea) => {
    // Background verification - don't block UI
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('area_name')
        .eq('id', authUser.id)
        .single();

      if (data && data.area_name !== cachedArea) {
        // Update if cache is stale
        setUserArea(data.area_name);
        localStorage.setItem(`userArea_${authUser.id}`, data.area_name);
      }
    } catch (error) {
      console.error('Error verifying user profile:', error);
    }
  };

  const loadUserProfile = async (authUser) => {
    // Prevent duplicate calls
    if (isLoadingProfile.current) {
      return;
    }

    isLoadingProfile.current = true;

    try {
      // Check if user profile exists
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUser(authUser);
        setUserArea(data.area_name);
        // Cache the area for faster subsequent loads
        localStorage.setItem(`userArea_${authUser.id}`, data.area_name);
      } else {
        // New user - check for pending area from signup
        const pendingArea = localStorage.getItem('pendingArea');
        if (pendingArea) {
          await createUserProfile(authUser, pendingArea);
          localStorage.removeItem('pendingArea');
        } else {
          // Sign out if no area selected
          await supabase.auth.signOut();
          alert('Please sign up and select your area');
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      isLoadingProfile.current = false;
      setAuthLoading(false);
    }
  };

  const createUserProfile = async (authUser, area) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .insert([
          {
            id: authUser.id,
            email: authUser.email,
            area_name: area,
          },
        ]);

      if (error) throw error;

      setUser(authUser);
      setUserArea(area);
      // Cache the area and user ID
      localStorage.setItem(`userArea_${authUser.id}`, area);
      localStorage.setItem('cachedUserId', authUser.id);
    } catch (error) {
      console.error('Error creating user profile:', error);
      alert('Failed to create profile. Please try again.');
    }
  };

  const handleAuthSuccess = async (authUser) => {
    await loadUserProfile(authUser);
  };

  const handleSignOut = async () => {
    try {
      // Clear all cache before signing out
      const cachedUserId = localStorage.getItem('cachedUserId');
      if (cachedUserId) {
        localStorage.removeItem('cachedUserId');
        localStorage.removeItem(`userArea_${cachedUserId}`);
      }
      if (user?.id) {
        localStorage.removeItem(`userArea_${user.id}`);
      }
      await supabase.auth.signOut();
      setUser(null);
      setUserArea('');
      setDivisionData([]);
      setAreaWiseData([]);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const toNumber = (val) => {
    if (val === null || val === undefined || val === '') return 0;
    if (typeof val === 'string') val = val.replace(/,/g, '');
    return isNaN(val) ? 0 : Number(val);
  };

  const normalize = (text) => {
    return String(text).replace(/\s+/g, '').replace(/\./g, '').toLowerCase();
  };

  const findColumn = (row, keywords) => {
    for (let col in row) {
      const name = normalize(col);
      if (keywords.some(k => name.includes(k))) return col;
    }
    return null;
  };

  // Updated findColumn to handle special header formats with percentages and varying spacing
  const findColumnExtended = (row, keywords, allowPercentage = false) => {
    for (let col in row) {
      const name = normalize(col);
      // Check for main keywords
      const hasMainKeyword = keywords.some(k => name.includes(k));
      if (hasMainKeyword) {
        // If percentage columns, check for percentage keyword too
        if (allowPercentage && !name.includes('percentage') && !name.includes('%')) {
          return col;
        } else if (!allowPercentage && name.includes('percentage')) {
          continue; // Skip percentage columns if not requested
        }
        return col;
      }
    }
    return null;
  };

  const handleFile = (file) => {
    if (!file) return;
    
    // Validate file type
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type)) {
      alert('❌ Please upload a valid Excel file (.xls or .xlsx)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('❌ File size exceeds 10MB limit');
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        processData(raw);
      } catch (error) {
        alert('❌ Error reading file. Please ensure it is a valid Excel file.');
        console.error('File read error:', error);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      alert('❌ Error reading file');
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const processData = (raw) => {
    let headerIndex = -1;

    for (let i = 0; i < raw.length; i++) {
      const text = raw[i].join(' ').toLowerCase();
      // Updated to support both original format and new format with spacing
      if (
        text.includes('division') &&
        text.includes('area') &&
        text.includes('plaza') &&
        (text.includes('collectible') || text.includes('collectable'))
      ) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      alert('❌ Could not detect header row.');
      return;
    }

    const headers = raw[headerIndex];
    const dataRows = raw.slice(headerIndex + 1);

    const rows = dataRows.map(r => {
      let obj = {};
      headers.forEach((h, i) => (obj[h] = r[i]));
      return obj;
    });

    generateSummaries(rows);
  };

  const generateSummaries = (rows) => {
    const grouped = {};
    const areaWiseMap = {};

    rows.forEach(row => {
      const divisionCol = findColumn(row, ['division']);
      const areaCol = findColumn(row, ['area']);
      const plazaCol = findColumn(row, ['plaza']);

      // Updated column detection to support both original and new header formats
      const collectibleQtyCol = findColumn(row, ['collectibleaccqty', 'collectableaccqty']);
      const collectedQtyCol = findColumn(row, ['collectedaccqty', 'collectedaccqty']);
      const collectibleAmtCol = findColumn(row, ['collectibleamt', 'collectableamt']);
      const collectedAmtCol = findColumn(row, ['collectedamt', 'collectedamt']);
      const prevOverdueCol = findColumn(row, ['previousmonthoverdue', 'previousmonthoverdue']);
      const runOverdueCol = findColumn(row, ['runningmonthoverdue', 'runningmonthoverdue']);

      const division = String(row[divisionCol] || '').trim();
      const area = String(row[areaCol] || '').trim();
      const plaza = String(row[plazaCol] || '').trim();

      if (!division || !area || division.toLowerCase() === 'division' || area.toLowerCase() === 'area') return;

      const collectibleQty = toNumber(row[collectibleQtyCol]);
      const collectedQty = toNumber(row[collectedQtyCol]);
      const collectibleAmt = toNumber(row[collectibleAmtCol]);
      const collectedAmt = toNumber(row[collectedAmtCol]);
      const prevOverdue = toNumber(row[prevOverdueCol]);
      const runOverdue = toNumber(row[runOverdueCol]);

      const key = division + '|' + area;

      if (!grouped[key]) {
        grouped[key] = {
          Division: division,
          Area: area,
          CollectibleQty: 0,
          CollectedQty: 0,
          CollectibleAmt: 0,
          CollectedAmt: 0,
          PrevOverdue: 0,
          RunOverdue: 0,
        };
      }

      grouped[key].CollectibleQty += collectibleQty;
      grouped[key].CollectedQty += collectedQty;
      grouped[key].CollectibleAmt += collectibleAmt;
      grouped[key].CollectedAmt += collectedAmt;
      grouped[key].PrevOverdue += prevOverdue;
      grouped[key].RunOverdue += runOverdue;

      const areaKey = area;
      if (!areaWiseMap[areaKey]) {
        areaWiseMap[areaKey] = [];
      }
      areaWiseMap[areaKey].push({
        Division: division,
        Area: area,
        Plaza: plaza,
        Collectible_Acc_Qty: collectibleQty,
        Collected_Acc_Qty: collectedQty,
        Collection_Qty_Percent: collectibleQty > 0 ? ((collectedQty / collectibleQty) * 100).toFixed(2) : '0.00',
        Collectible_Amount: collectibleAmt,
        Collected_Amount: collectedAmt,
        Collection_Amt_Percent: collectibleAmt > 0 ? ((collectedAmt / collectibleAmt) * 100).toFixed(2) : '0.00',
        Previous_Overdue: prevOverdue,
        Running_Overdue: runOverdue,
        Overdue_Change: runOverdue - prevOverdue,
      });
    });

    const divisionSummary = generateDivisionSummary(grouped);
    const areaWiseSummary = generateAreaWiseSummary(areaWiseMap);

    setDivisionData(divisionSummary);
    setAreaWiseData(areaWiseSummary);

    const divisionList = [...new Set(areaWiseSummary.map(d => d.Division).filter(d => d && !d.includes('SUBTOTAL')))].sort();
    setDivisions(divisionList);
    setSelectedDivision('');

    // Send Telegram notification with usage tracking and Tangail report
    sendUploadNotification(areaWiseSummary).catch(err => {
      console.error('Telegram notification failed:', err);
      // Don't show error to user, just log it
    });
  };

  const generateDivisionSummary = (grouped) => {
    let summaryData = [];
    const divisionGroups = {};
    let grandTotalQty = 0, grandTotalCollectedQty = 0, grandTotalAmt = 0, grandTotalCollectedAmt = 0, grandTotalPrevOverdue = 0, grandTotalRunOverdue = 0;

    Object.values(grouped).forEach(row => {
      if (!divisionGroups[row.Division]) {
        divisionGroups[row.Division] = [];
      }
      divisionGroups[row.Division].push(row);
      grandTotalQty += row.CollectibleQty;
      grandTotalCollectedQty += row.CollectedQty;
      grandTotalAmt += row.CollectibleAmt;
      grandTotalCollectedAmt += row.CollectedAmt;
      grandTotalPrevOverdue += row.PrevOverdue;
      grandTotalRunOverdue += row.RunOverdue;
    });

    Object.keys(divisionGroups)
      .sort()
      .forEach(division => {
        const areas = divisionGroups[division];

        areas.forEach(area => {
          summaryData.push({
            Division: area.Division,
            Area: area.Area,
            Collectible_Acc_Qty: area.CollectibleQty,
            Collected_Acc_Qty: area.CollectedQty,
            Collection_Qty_Percent: area.CollectibleQty > 0 ? ((area.CollectedQty / area.CollectibleQty) * 100).toFixed(2) : '0.00',
            Collectible_Amount: area.CollectibleAmt,
            Collected_Amount: area.CollectedAmt,
            Collection_Amt_Percent: area.CollectibleAmt > 0 ? ((area.CollectedAmt / area.CollectibleAmt) * 100).toFixed(2) : '0.00',
            Previous_Overdue: area.PrevOverdue,
            Running_Overdue: area.RunOverdue,
            Overdue_Change: area.RunOverdue - area.PrevOverdue,
          });
        });

        const collectibleQtySum = areas.reduce((sum, a) => sum + a.CollectibleQty, 0);
        const collectedQtySum = areas.reduce((sum, a) => sum + a.CollectedQty, 0);
        const collectibleAmtSum = areas.reduce((sum, a) => sum + a.CollectibleAmt, 0);
        const collectedAmtSum = areas.reduce((sum, a) => sum + a.CollectedAmt, 0);
        const prevOverdueSum = areas.reduce((sum, a) => sum + a.PrevOverdue, 0);
        const runOverdueSum = areas.reduce((sum, a) => sum + a.RunOverdue, 0);

        summaryData.push({
          Division: '',
          Area: `${division} - SUBTOTAL`,
          Collectible_Acc_Qty: collectibleQtySum,
          Collected_Acc_Qty: collectedQtySum,
          Collection_Qty_Percent: collectibleQtySum > 0 ? ((collectedQtySum / collectibleQtySum) * 100).toFixed(2) : '0.00',
          Collectible_Amount: collectibleAmtSum,
          Collected_Amount: collectedAmtSum,
          Collection_Amt_Percent: collectibleAmtSum > 0 ? ((collectedAmtSum / collectibleAmtSum) * 100).toFixed(2) : '0.00',
          Previous_Overdue: prevOverdueSum,
          Running_Overdue: runOverdueSum,
          Overdue_Change: runOverdueSum - prevOverdueSum,
          isSubtotal: true,
        });
      });

    summaryData.push({
      Division: '',
      Area: 'GRAND TOTAL',
      Collectible_Acc_Qty: grandTotalQty,
      Collected_Acc_Qty: grandTotalCollectedQty,
      Collection_Qty_Percent: grandTotalQty > 0 ? ((grandTotalCollectedQty / grandTotalQty) * 100).toFixed(2) : '0.00',
      Collectible_Amount: grandTotalAmt,
      Collected_Amount: grandTotalCollectedAmt,
      Collection_Amt_Percent: grandTotalAmt > 0 ? ((grandTotalCollectedAmt / grandTotalAmt) * 100).toFixed(2) : '0.00',
      Previous_Overdue: grandTotalPrevOverdue,
      Running_Overdue: grandTotalRunOverdue,
      Overdue_Change: grandTotalRunOverdue - grandTotalPrevOverdue,
      isGrandTotal: true,
    });

    return summaryData;
  };

  const generateAreaWiseSummary = (areaWiseMap) => {
    let areaWiseSummary = [];

    Object.keys(areaWiseMap)
      .sort()
      .forEach(area => {
        const plazas = areaWiseMap[area];
        
        // Add individual plaza rows
        plazas.forEach(plaza => {
          areaWiseSummary.push(plaza);
        });

        // Add area subtotal after all plazas of that area
        const collectibleQtySum = plazas.reduce((sum, p) => sum + toNumber(p.Collectible_Acc_Qty), 0);
        const collectedQtySum = plazas.reduce((sum, p) => sum + toNumber(p.Collected_Acc_Qty), 0);
        const collectibleAmtSum = plazas.reduce((sum, p) => sum + toNumber(p.Collectible_Amount), 0);
        const collectedAmtSum = plazas.reduce((sum, p) => sum + toNumber(p.Collected_Amount), 0);
        const prevOverdueSum = plazas.reduce((sum, p) => sum + toNumber(p.Previous_Overdue), 0);
        const runOverdueSum = plazas.reduce((sum, p) => sum + toNumber(p.Running_Overdue), 0);

        areaWiseSummary.push({
          Division: '',
          Area: `${area} - SUBTOTAL`,
          Plaza: '',
          Collectible_Acc_Qty: collectibleQtySum,
          Collected_Acc_Qty: collectedQtySum,
          Collection_Qty_Percent: collectibleQtySum > 0 ? ((collectedQtySum / collectibleQtySum) * 100).toFixed(2) : '0.00',
          Collectible_Amount: collectibleAmtSum,
          Collected_Amount: collectedAmtSum,
          Collection_Amt_Percent: collectibleAmtSum > 0 ? ((collectedAmtSum / collectibleAmtSum) * 100).toFixed(2) : '0.00',
          Previous_Overdue: prevOverdueSum,
          Running_Overdue: runOverdueSum,
          Overdue_Change: runOverdueSum - prevOverdueSum,
          isSubtotal: true,
        });
      });

    // Add grand total for area-wise summary
    let grandTotalQty = 0, grandTotalCollectedQty = 0, grandTotalAmt = 0, grandTotalCollectedAmt = 0, grandTotalPrevOverdue = 0, grandTotalRunOverdue = 0;
    
    Object.values(areaWiseMap).forEach(plazas => {
      plazas.forEach(plaza => {
        grandTotalQty += toNumber(plaza.Collectible_Acc_Qty);
        grandTotalCollectedQty += toNumber(plaza.Collected_Acc_Qty);
        grandTotalAmt += toNumber(plaza.Collectible_Amount);
        grandTotalCollectedAmt += toNumber(plaza.Collected_Amount);
        grandTotalPrevOverdue += toNumber(plaza.Previous_Overdue);
        grandTotalRunOverdue += toNumber(plaza.Running_Overdue);
      });
    });

    areaWiseSummary.push({
      Division: '',
      Area: 'GRAND TOTAL',
      Plaza: '',
      Collectible_Acc_Qty: grandTotalQty,
      Collected_Acc_Qty: grandTotalCollectedQty,
      Collection_Qty_Percent: grandTotalQty > 0 ? ((grandTotalCollectedQty / grandTotalQty) * 100).toFixed(2) : '0.00',
      Collectible_Amount: grandTotalAmt,
      Collected_Amount: grandTotalCollectedAmt,
      Collection_Amt_Percent: grandTotalAmt > 0 ? ((grandTotalCollectedAmt / grandTotalAmt) * 100).toFixed(2) : '0.00',
      Previous_Overdue: grandTotalPrevOverdue,
      Running_Overdue: grandTotalRunOverdue,
      Overdue_Change: grandTotalRunOverdue - grandTotalPrevOverdue,
      isGrandTotal: true,
    });

    return areaWiseSummary;
  };

  const downloadExcel = (data, filename) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Summary');
    XLSX.writeFile(workbook, filename);
  };

  const scrollToStatistics = () => {
    if (statisticsRef.current) {
      statisticsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSaveYesterdayData = async () => {
    if (areaWiseData.length === 0) {
      alert('❌ No data available. Please upload an Excel file first.');
      return;
    }

    // Filter Division-02 areas
    const division02Areas = ['dhaka west', 'gazipur west', 'sirajgonj', 'tangail'];
    const areaReports = [];

    division02Areas.forEach(areaName => {
      const areaData = areaWiseData.filter(
        row => row.Area && row.Area.toLowerCase().includes(areaName) && row.isSubtotal
      );

      if (areaData.length > 0) {
        const area = areaData[0];
        areaReports.push({
          name: area.Area.replace(' - SUBTOTAL', ''),
          collectedQty: area.Collected_Acc_Qty || 0,
        });
      }
    });

    // Filter Tangail plaza data
    const tangailPlazaData = areaWiseData.filter(
      row => row.Area && row.Area.toLowerCase().includes('tangail') && !row.isSubtotal && !row.isGrandTotal && row.Plaza
    );

    const plazaReports = tangailPlazaData.map(plaza => ({
      name: plaza.Plaza,
      collectedQty: plaza.Collected_Acc_Qty || 0,
    }));

    if (areaReports.length === 0 && plazaReports.length === 0) {
      alert('❌ No Division-02 or Tangail data found in the uploaded file.');
      return;
    }

    let confirmMessage = '💾 Save this data as Yesterday\'s Data?\n\n';
    
    if (areaReports.length > 0) {
      confirmMessage += '📊 DIVISION-02 AREAS:\n';
      confirmMessage += areaReports.map(a => `${a.name}: ${a.collectedQty} cards`).join('\n');
    }
    
    if (plazaReports.length > 0) {
      confirmMessage += '\n\n🏪 TANGAIL PLAZAS:\n';
      confirmMessage += plazaReports.map(p => `${p.name}: ${p.collectedQty} cards`).join('\n');
    }
    
    confirmMessage += '\n\nThis will be used for comparison when you upload today\'s file.';

    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) return;

    // Save both Division-02 and Tangail data
    const success1 = areaReports.length > 0 ? await saveTodayData(areaReports) : true;
    const success2 = plazaReports.length > 0 ? await saveTangailPlazaData(plazaReports) : true;

    if (success1 && success2) {
      alert('✅ Yesterday\'s data saved successfully!\n\nNow upload today\'s Excel file to see the comparison in Telegram.');
    } else {
      alert('❌ Failed to save data. Please check your internet connection and try again.');
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="app">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📊</div>
            <div>Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="app">
      <Header 
        onScrollToStats={scrollToStatistics}
        showStatsButton={divisionData.length > 0}
        onSaveYesterdayData={handleSaveYesterdayData}
        showSaveButton={areaWiseData.length > 0}
        user={user}
        userArea={userArea}
        onSignOut={handleSignOut}
      />
      
      <div className="app-wrapper">
        <div className="container">
          <div className="instruction-box">
            <h3>📋 Instructions / নির্দেশনা</h3>
            <p>POS এ লগিন করে - Sales &gt; Reports &gt; Hire Acc Target & Ach &gt; Collection Tr. & Achv. Summary Report ডাউনলোড করে আপলোড করুন</p>
          </div>

          <Sidebar userEmail={user?.email} />

          <FileUpload onFileUpload={handleFile} loading={loading} />

          {areaWiseData.length > 0 && userArea && (
            <MyAreaReport userArea={userArea} areaWiseData={areaWiseData} />
          )}

          {areaWiseData.length > 0 && userArea && (
            <TangailDailyReport userArea={userArea} areaWiseData={areaWiseData} />
          )}

          {divisionData.length > 0 && (
            <>
              <DivisionSummary 
                data={divisionData} 
                areaWiseData={areaWiseData}
                divisions={divisions}
                selectedDivision={selectedDivision}
                onDivisionChange={setSelectedDivision}
                selectedArea={selectedArea}
                onAreaChange={setSelectedArea}
                onDownload={() => downloadExcel(divisionData, 'division_summary.xlsx')} 
              />
              <AreaWiseSummary
                data={areaWiseData}
                divisions={divisions}
                selectedDivision={selectedDivision}
                onDivisionChange={setSelectedDivision}
                onDownload={() => downloadExcel(areaWiseData, 'area_wise_summary.xlsx')}
              />
              <DailyComparison />
              <div ref={statisticsRef}>
                <OverdueStatistics areaWiseData={areaWiseData} divisionData={divisionData} />
              </div>
              <AnalyticsSection areaWiseData={areaWiseData} />
            </>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default App;
