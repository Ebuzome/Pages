// intake.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css'; // We'll create this file for styles

// Import Three.js
import * as THREE from 'three';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, collection, addDoc, query, where, getDocs } from 'firebase/firestore';

// Phosphor icons (you'll need to install: npm install @phosphor-icons/react)
import { 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  CreditCard, 
  House, 
  Briefcase, 
  Scales,
  FileText,
  Lock,
  Spinner,
  XCircle,
  Warning,
  Info,
  CheckCircle
} from '@phosphor-icons/react';

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBrPHXqZvGD6Y9RoXUwarkg5AFjX8t7nJI",
  authDomain: "intake-form-20a68.firebaseapp.com",
  projectId: "intake-form-20a68",
  storageBucket: "intake-form-20a68.firebasestorage.app",
  messagingSenderId: "81594413185",
  appId: "1:81594413185:web:8aad81f850a86517d9dd80",
  measurementId: "G-3ETHQKK152"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// ====================
// THREE.JS MONOLITH COMPONENT
// ====================
const Monolith = ({ currentStep }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const meshRef = useRef(null);
  const edgesRef = useRef(null);
  const frameIdRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(2, 1.5, 3);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(300, 300);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(1, 2, 1);
    scene.add(dirLight);

    const backLight = new THREE.DirectionalLight(0x444444, 0.5);
    backLight.position.set(-1, -1, -1);
    scene.add(backLight);

    // Materials
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      emissive: 0x111111,
      roughness: 0.3,
      metalness: 0.8,
      emissiveIntensity: 0.2
    });

    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xE67E22 });

    // Create initial geometry
    createGeometry(1);

    function createGeometry(step) {
      if (meshRef.current) scene.remove(meshRef.current);
      if (edgesRef.current && meshRef.current) {
        meshRef.current.remove(edgesRef.current);
      }

      let geometry;
      
      switch(step) {
        case 1:
          geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
          break;
        case 2:
          geometry = new THREE.IcosahedronGeometry(0.9, 0);
          break;
        case 3:
          geometry = new THREE.TorusKnotGeometry(0.6, 0.2, 64, 8, 2, 3);
          break;
        case 4:
          geometry = new THREE.OctahedronGeometry(0.9, 1);
          break;
        default:
          geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
      }

      const mesh = new THREE.Mesh(geometry, metalMaterial);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      meshRef.current = mesh;

      const edges = new THREE.EdgesGeometry(geometry);
      const edgesLine = new THREE.LineSegments(edges, edgeMaterial);
      mesh.add(edgesLine);
      edgesRef.current = edgesLine;
    }

    // Animation
    const animate = () => {
      if (meshRef.current) {
        meshRef.current.rotation.y += 0.005;
        meshRef.current.rotation.x += 0.002;
      }
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    // Handle resize
    const handleResize = () => {
      const size = Math.min(300, window.innerWidth * 0.3);
      if (rendererRef.current && cameraRef.current) {
        rendererRef.current.setSize(size, size);
        cameraRef.current.aspect = 1;
        cameraRef.current.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (mountRef.current && rendererRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      if (meshRef.current) {
        scene.remove(meshRef.current);
      }
    };
  }, []);

  // Update geometry when step changes
  useEffect(() => {
    if (!sceneRef.current || !meshRef.current) return;

    const step = currentStep;
    
    if (meshRef.current) sceneRef.current.remove(meshRef.current);
    if (edgesRef.current && meshRef.current) {
      meshRef.current.remove(edgesRef.current);
    }

    let geometry;
    
    switch(step) {
      case 1:
        geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
        break;
      case 2:
        geometry = new THREE.IcosahedronGeometry(0.9, 0);
        break;
      case 3:
        geometry = new THREE.TorusKnotGeometry(0.6, 0.2, 64, 8, 2, 3);
        break;
      case 4:
        geometry = new THREE.OctahedronGeometry(0.9, 1);
        break;
      default:
        geometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    }

    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0x222222,
      emissive: 0x111111,
      roughness: 0.3,
      metalness: 0.8,
      emissiveIntensity: 0.2
    });

    const mesh = new THREE.Mesh(geometry, metalMaterial);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    sceneRef.current.add(mesh);
    meshRef.current = mesh;

    const edges = new THREE.EdgesGeometry(geometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xE67E22 });
    const edgesLine = new THREE.LineSegments(edges, edgeMaterial);
    mesh.add(edgesLine);
    edgesRef.current = edgesLine;
  }, [currentStep]);

  return <div ref={mountRef} className="monolith-container" id="monolith-container" />;
};

// ====================
// NOTIFICATION COMPONENT
// ====================
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch(type) {
      case 'success': return <CheckCircle size={20} className="notification-icon" />;
      case 'error': return <XCircle size={20} className="notification-icon" />;
      case 'warning': return <Warning size={20} className="notification-icon" />;
      case 'info': return <Info size={20} className="notification-icon" />;
      default: return <Info size={20} className="notification-icon" />;
    }
  };

  return (
    <div className={`notification ${type}`}>
      {getIcon()}
      <span>{message}</span>
    </div>
  );
};

// ====================
// STEP 1 COMPONENT
// ====================
const Step1 = ({ selectedScore, setSelectedScore, creditBarWidth, setCreditBarWidth }) => {
  const handleSelect = (score) => {
    setSelectedScore(score);
    let width = '0%';
    if (score === '740') width = '90%';
    else if (score === '680') width = '70%';
    else if (score === '620') width = '40%';
    else width = '15%';
    setCreditBarWidth(width);
  };

  return (
    <div className="step active" id="step1">
      <h1>Let's find your<br />best funding path.</h1>
      <div className="subhead">credit profile</div>
      <p className="text-gray-500 text-sm mb-6">To match you with capital-raising strategies, we need your current credit profile.</p>

      <div className="space-y-2">
        <div 
          className={`radio-card ${selectedScore === '740' ? 'selected' : ''}`} 
          data-score="740"
          onClick={() => handleSelect('740')}
        >
          <div className="flex items-center">
            <span className="custom-radio"></span>
            <span className="font-medium">740+ (Excellent)</span>
          </div>
          <span className="text-xs text-gray-500">high-limit 0% APR</span>
        </div>
        <div 
          className={`radio-card ${selectedScore === '680' ? 'selected' : ''}`} 
          data-score="680"
          onClick={() => handleSelect('680')}
        >
          <div className="flex items-center">
            <span className="custom-radio"></span>
            <span className="font-medium">680–739 (Good)</span>
          </div>
          <span className="text-xs text-gray-500">equity & credit funding</span>
        </div>
        <div 
          className={`radio-card ${selectedScore === '620' ? 'selected' : ''}`} 
          data-score="620"
          onClick={() => handleSelect('620')}
        >
          <div className="flex items-center">
            <span className="custom-radio"></span>
            <span className="font-medium">620–679 (Fair)</span>
          </div>
          <span className="text-xs text-gray-500">asset-based</span>
        </div>
        <div 
          className={`radio-card ${selectedScore === 'below' ? 'selected' : ''}`} 
          data-score="below"
          onClick={() => handleSelect('below')}
        >
          <div className="flex items-center">
            <span className="custom-radio"></span>
            <span className="font-medium">Below 620 (Challenged)</span>
          </div>
          <span className="text-xs text-gray-500">debt recovery first</span>
        </div>
      </div>

      {/* Credit bar */}
      <div className="credit-bar-container">
        <div className="credit-bar-track">
          <div className="credit-bar-fill" id="creditBar" style={{ width: creditBarWidth }}></div>
        </div>
        <div className="credit-labels">
          <span>500</span><span>600</span><span>700</span><span>800+</span>
        </div>
      </div>
    </div>
  );
};

// ====================
// STEP 2 COMPONENT
// ====================
const Step2 = ({ selectedGoal, setSelectedGoal }) => {
  const handleSelect = (goal) => {
    setSelectedGoal(goal);
  };

  return (
    <div className="step" id="step2">
      <h1>What is your<br />primary goal?</h1>
      <div className="subhead">motivation</div>

      <div className="space-y-2">
        <div 
          className={`radio-card ${selectedGoal === 'credit' ? 'selected' : ''}`} 
          data-goal="credit"
          onClick={() => handleSelect('credit')}
        >
          <div className="flex items-center">
            <span className="custom-radio"></span>
            <div>
              <div className="font-medium">Credit Card Debt Recovery</div>
              <div className="text-xs text-gray-500">protect score while clearing debt</div>
            </div>
          </div>
          <CreditCard size={24} className="text-gray-400 text-xl" />
        </div>
        <div 
          className={`radio-card ${selectedGoal === 'home' ? 'selected' : ''}`} 
          data-goal="home"
          onClick={() => handleSelect('home')}
        >
          <div className="flex items-center">
            <span className="custom-radio"></span>
            <div>
              <div className="font-medium">Homeowner Equity Release</div>
              <div className="text-xs text-gray-500">tap home value, no new payments</div>
            </div>
          </div>
          <House size={24} className="text-gray-400 text-xl" />
        </div>
        <div 
          className={`radio-card ${selectedGoal === 'business' ? 'selected' : ''}`} 
          data-goal="business"
          onClick={() => handleSelect('business')}
        >
          <div className="flex items-center">
            <span className="custom-radio"></span>
            <div>
              <div className="font-medium">Business Growth Capital</div>
              <div className="text-xs text-gray-500">funding for LLC/venture</div>
            </div>
          </div>
          <Briefcase size={24} className="text-gray-400 text-xl" />
        </div>
        <div 
          className={`radio-card ${selectedGoal === 'consolidate' ? 'selected' : ''}`} 
          data-goal="consolidate"
          onClick={() => handleSelect('consolidate')}
        >
          <div className="flex items-center">
            <span className="custom-radio"></span>
            <div>
              <div className="font-medium">General Debt Consolidation</div>
              <div className="text-xs text-gray-500">combine loans into one plan</div>
            </div>
          </div>
          <Scales size={24} className="text-gray-400 text-xl" />
        </div>
      </div>
    </div>
  );
};

// ====================
// STEP 3 COMPONENT
// ====================
const Step3 = ({ debt, setDebt, homeOwner, setHomeOwner, income, setIncome }) => {
  return (
    <div className="step" id="step3">
      <h1>Just a few more<br />details...</h1>
      <div className="subhead">financial fingerprint</div>

      <div className="space-y-6">
        <div className="input-group">
          <span className="currency">$</span>
          <input 
            type="text" 
            id="debt" 
            placeholder=" " 
            value={debt}
            onChange={(e) => setDebt(e.target.value)}
          />
          <label htmlFor="debt">Total debt</label>
        </div>

        <div>
          <p className="text-sm text-gray-500 mb-3">Are you a homeowner?</p>
          <div className="toggle-group">
            <span 
              className={`toggle-option ${homeOwner ? 'active' : ''}`} 
              id="homeYes"
              onClick={() => setHomeOwner(true)}
            >
              Yes
            </span>
            <span 
              className={`toggle-option ${!homeOwner ? 'active' : ''}`} 
              id="homeNo"
              onClick={() => setHomeOwner(false)}
            >
              No
            </span>
          </div>
        </div>

        <div className="input-group">
          <span className="currency">$</span>
          <input 
            type="text" 
            id="income" 
            placeholder=" " 
            value={income}
            onChange={(e) => setIncome(e.target.value)}
          />
          <label htmlFor="income">Monthly income</label>
        </div>
      </div>
    </div>
  );
};

// ====================
// STEP 4 COMPONENT
// ====================
const Step4 = ({ selectedScore, selectedGoal, debt, homeOwner, income }) => {
  const getScoreText = () => {
    switch(selectedScore) {
      case '740': return '740+ (Excellent)';
      case '680': return '680-739 (Good)';
      case '620': return '620-679 (Fair)';
      case 'below': return 'Below 620 (Challenged)';
      default: return '740+ (Excellent)';
    }
  };

  const getGoalText = () => {
    switch(selectedGoal) {
      case 'credit': return 'Credit Card Debt Recovery';
      case 'home': return 'Homeowner Equity Release';
      case 'business': return 'Business Growth Capital';
      case 'consolidate': return 'General Debt Consolidation';
      default: return 'Credit Card Debt Recovery';
    }
  };

  const homeStatus = homeOwner ? 'Homeowner' : 'Not a homeowner';

  return (
    <div className="step" id="step4">
      <h1>Analysis in<br />Progress</h1>
      <div className="subhead">final review</div>
      <p className="text-gray-500 mb-8 text-sm">Our team is reviewing your profile against active capital-raising programs.</p>

      {/* Summary card */}
      <div className="bg-gray-50 p-6 mb-8 border border-gray-100">
        <div className="flex items-center gap-4">
          <FileText size={24} className="text-2xl text-gray-500" />
          <div>
            <div className="font-medium" id="summaryCredit">{getScoreText()} · {getGoalText()}</div>
            <div className="text-sm text-gray-500" id="summaryDetails">{homeStatus} · ${debt} debt · ${income}/mo</div>
          </div>
        </div>
      </div>

      {/* Encryption badge */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-8">
        <Lock size={16} />
        <span>256-bit encryption · never shared with third parties</span>
      </div>
    </div>
  );
};

// ====================
// MAIN APP COMPONENT
// ====================
function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedScore, setSelectedScore] = useState('740');
  const [selectedGoal, setSelectedGoal] = useState('credit');
  const [debt, setDebt] = useState('45,000');
  const [homeOwner, setHomeOwner] = useState(true);
  const [income, setIncome] = useState('8,200');
  const [creditBarWidth, setCreditBarWidth] = useState('90%');
  const [notifications, setNotifications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Utility functions
  const showNotification = (message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // IP tracking functions
  const getDetailedIPInfo = async () => {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      
      return {
        ipAddress: data.ip,
        ipCity: data.city,
        ipRegion: data.region,
        ipCountry: data.country_name,
        ipPostal: data.postal,
        ipLatitude: data.latitude,
        ipLongitude: data.longitude,
        ipTimezone: data.timezone,
        ipISP: data.org,
        ipASN: data.asn,
        ipCountryCode: data.country_code,
        ipContinent: data.continent_code
      };
    } catch (error) {
      console.error('Error getting IP details:', error);
      try {
        const simpleResponse = await fetch('https://api.ipify.org?format=json');
        const simpleData = await simpleResponse.json();
        return {
          ipAddress: simpleData.ip,
          ipCity: null,
          ipRegion: null,
          ipCountry: null,
          ipPostal: null,
          ipLatitude: null,
          ipLongitude: null,
          ipTimezone: null,
          ipISP: null,
          ipASN: null,
          ipCountryCode: null,
          ipContinent: null
        };
      } catch (fallbackError) {
        console.error('Fallback IP failed:', fallbackError);
        return {
          ipAddress: 'Unknown',
          ipCity: null,
          ipRegion: null,
          ipCountry: null
        };
      }
    }
  };

  const checkForDuplicateIP = async (ipAddress) => {
    try {
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      
      const submissionsRef = collection(db, 'intakeSubmissions');
      const q = query(
        submissionsRef, 
        where('ipAddress', '==', ipAddress),
        where('submittedAt', '>=', oneDayAgo)
      );
      
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking duplicates:', error);
      return false;
    }
  };

  const saveToFirebase = async (formData) => {
    try {
      const ipInfo = await getDetailedIPInfo();
      
      const submissionsRef = collection(db, 'intakeSubmissions');
      const docRef = await addDoc(submissionsRef, {
        ...formData,
        submittedAt: new Date(),
        clientTimestamp: new Date().toISOString(),
        ...ipInfo,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        referrer: document.referrer || 'direct',
        status: 'pending'
      });
      
      console.log('✅ Form saved to Firebase with ID:', docRef.id);
      console.log('📍 IP Address:', ipInfo.ipAddress);
      
      return { success: true, id: docRef.id, ip: ipInfo.ipAddress };
    } catch (error) {
      console.error('❌ Firebase error:', error);
      return { success: false, error };
    }
  };

  // Navigation
  const goToStep = (newStep) => {
    if (newStep < 1 || newStep > 4) return;
    setCurrentStep(newStep);
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      // Step validation
      if (currentStep === 1 && !selectedScore) {
        showNotification('Please select your credit range', 'warning');
        return;
      }
      if (currentStep === 2 && !selectedGoal) {
        showNotification('Please select a goal', 'warning');
        return;
      }
      goToStep(currentStep + 1);
    } else {
      // FINAL SUBMIT - Save to Firebase with IP tracking
      setIsSubmitting(true);
      
      const ipInfo = await getDetailedIPInfo();
      const isDuplicate = await checkForDuplicateIP(ipInfo.ipAddress);
      
      if (isDuplicate) {
        showNotification('You have already submitted a form recently. Please contact support.', 'warning');
        setIsSubmitting(false);
        return;
      }
      
      const formData = {
        creditScore: selectedScore,
        primaryGoal: selectedGoal,
        debtAmount: debt,
        isHomeowner: homeOwner,
        monthlyIncome: income,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screenSize: `${window.screen.width}x${window.screen.height}`,
        referrer: document.referrer || 'direct'
      };
      
      const result = await saveToFirebase(formData);
      
      if (result.success) {
        showNotification(`✅ Form submitted! IP: ${result.ip}`, 'success');
        // Optional: redirect after 2 seconds
        // setTimeout(() => {
        //   window.location.href = 'thank-you.html';
        // }, 2000);
      } else {
        showNotification('Error submitting form. Please try again.', 'error');
      }
      
      setIsSubmitting(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  };

  // Render step based on current step
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <Step1 
            selectedScore={selectedScore}
            setSelectedScore={setSelectedScore}
            creditBarWidth={creditBarWidth}
            setCreditBarWidth={setCreditBarWidth}
          />
        );
      case 2:
        return (
          <Step2 
            selectedGoal={selectedGoal}
            setSelectedGoal={setSelectedGoal}
          />
        );
      case 3:
        return (
          <Step3 
            debt={debt}
            setDebt={setDebt}
            homeOwner={homeOwner}
            setHomeOwner={setHomeOwner}
            income={income}
            setIncome={setIncome}
          />
        );
      case 4:
        return (
          <Step4 
            selectedScore={selectedScore}
            selectedGoal={selectedGoal}
            debt={debt}
            homeOwner={homeOwner}
            income={income}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="App">
      {/* Geometric Background */}
      <div className="geometric-bg"></div>

      {/* Floating Particles */}
      <div className="floating-particles">
        <div className="particle">
          <svg viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" rx="8" stroke="currentColor" fill="none" strokeWidth="0.8" />
            <path d="M35 20 L35 80" stroke="currentColor" strokeWidth="0.6" />
            <path d="M65 20 L65 80" stroke="currentColor" strokeWidth="0.6" />
            <path d="M20 35 L80 35" stroke="currentColor" strokeWidth="0.6" />
            <path d="M20 65 L80 65" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="30" cy="30" r="2" fill="rgba(17,17,17,0.4)" />
            <circle cx="70" cy="70" r="2" fill="rgba(17,17,17,0.4)" />
          </svg>
        </div>
        <div className="particle orange">
          <svg viewBox="0 0 100 100">
            <rect x="15" y="15" width="70" height="70" rx="12" stroke="currentColor" fill="none" strokeWidth="0.9" />
            <path d="M30 15 L30 85" stroke="currentColor" strokeWidth="0.7" />
            <path d="M70 15 L70 85" stroke="currentColor" strokeWidth="0.7" />
            <path d="M15 30 L85 30" stroke="currentColor" strokeWidth="0.7" />
            <path d="M15 70 L85 70" stroke="currentColor" strokeWidth="0.7" />
            <circle cx="40" cy="40" r="2.5" fill="rgba(230,126,34,0.2)" />
            <circle cx="60" cy="60" r="2.5" fill="rgba(230,126,34,0.2)" />
          </svg>
        </div>
        <div className="particle grey">
          <svg viewBox="0 0 100 100">
            <rect x="25" y="25" width="50" height="50" rx="6" stroke="currentColor" fill="none" strokeWidth="0.7" />
            <path d="M35 25 L35 75" stroke="currentColor" strokeWidth="0.5" />
            <path d="M65 25 L65 75" stroke="currentColor" strokeWidth="0.5" />
            <path d="M25 35 L75 35" stroke="currentColor" strokeWidth="0.5" />
            <path d="M25 65 L75 65" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="45" cy="45" r="2" fill="rgba(102,102,102,0.3)" />
            <circle cx="55" cy="55" r="2" fill="rgba(102,102,102,0.3)" />
          </svg>
        </div>
        <div className="particle">
          <svg viewBox="0 0 100 100">
            <rect x="18" y="18" width="64" height="64" rx="10" stroke="currentColor" fill="none" strokeWidth="0.8" />
            <path d="M32 18 L32 82" stroke="currentColor" strokeWidth="0.6" />
            <path d="M68 18 L68 82" stroke="currentColor" strokeWidth="0.6" />
            <path d="M18 32 L82 32" stroke="currentColor" strokeWidth="0.6" />
            <path d="M18 68 L82 68" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="34" cy="34" r="2.2" fill="rgba(17,17,17,0.2)" />
            <circle cx="66" cy="66" r="2.2" fill="rgba(17,17,17,0.2)" />
          </svg>
        </div>
      </div>

      {/* THREE.JS MONOLITH */}
      <Monolith currentStep={currentStep} />

      {/* Notification Container */}
      <div className="notification-container">
        {notifications.map(({ id, message, type }) => (
          <Notification 
            key={id} 
            message={message} 
            type={type} 
            onClose={() => removeNotification(id)} 
          />
        ))}
      </div>

      {/* MERGED TOP PANEL */}
      <div className="top-panel">
        <div className="panel-row">
          <div className="no-hit-text">
            <ShieldCheck size={20} />
            <span><strong>NO CREDIT IMPACT</strong> · soft inquiry only</span>
          </div>
          <div className="step-indicator-mini" id="stepText">Step {currentStep}/4</div>
        </div>
        <div className="panel-progress">
          <div className="panel-progress-fill" id="progressFill" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="main-container">
        {/* Step Wrapper */}
        <div className="step-wrapper" id="stepWrapper">
          {renderStep()}
        </div>

        {/* BOLD BUTTON CONTAINER */}
        <div className="button-container">
          <button 
            className="btn-continue" 
            id="nextBtn" 
            onClick={handleNext}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span>Saving...</span>
                <Spinner size={20} className="ph-spin" />
              </>
            ) : currentStep === 4 ? (
              <>
                <span>Submit request</span>
                <Check size={20} />
              </>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>

        {/* Back button */}
        <div className="flex justify-center mt-4">
          <button 
            className="nav-btn" 
            id="prevBtn" 
            onClick={handlePrev}
            disabled={currentStep === 1}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
