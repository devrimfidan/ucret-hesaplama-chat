/**
 * Koç University Tuition Calculator
 * Multi-language, multi-step wizard for calculating tuition fees with discounts
 * 
 * Architecture:
 * - 3-step wizard interface (Basic Info → Additional Options → Final Details)
 * - Turkish/English language support with localStorage persistence
 * - Dynamic discount calculations (LYS Scholarship, Waivers, Sibling Discount)
 * - Installment vs Single payment options
 * - Real-time form validation and data filtering
 * 
 * @author Koç University
 * @version 2.0
 */

// ==================== GLOBAL VARIABLES ====================

let tuitionData = [];           // Array to store tuition data loaded from fees.json
let translations = {};          // Object to store translation data from translations.json
let currentLanguage = 'tr';     // Current UI language (tr = Turkish, en = English)
let currentStep = 1;            // Current wizard step (1: Basic Info, 2: Options, 3: Final)
const maxSteps = 3;             // Total number of wizard steps

// Data source URLs
const DATA_URL = 'assets/fees.json';
const TRANSLATIONS_URL = 'assets/translations.json';

// ==================== TRANSLATION SYSTEM ====================

/**
 * Loads translation data from translations.json file
 * Supports both Turkish (tr) and English (en) languages
 * Falls back to basic translations if loading fails
 */
async function loadTranslations() {
  try {
    console.log('Loading translations from:', TRANSLATIONS_URL);
    
    const response = await fetch(TRANSLATIONS_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    translations = await response.json();
    console.log('Translations loaded successfully');
    
  } catch (error) {
    console.error('Error loading translations:', error);
    // Fallback translations for critical elements
    translations = {
      tr: {
        page: { title: "Ücret Simülatörü", stepCounter: "Adım {current} / {total}" },
        buttons: { next: "Devam Et", back: "Geri", calculate: "Sonucu Hesapla" }
      },
      en: {
        page: { title: "Tuition Calculator", stepCounter: "Step {current} / {total}" },
        buttons: { next: "Continue", back: "Back", calculate: "Calculate Result" }
      }
    };
  }
}

/**
 * Translation helper function - retrieves translated text for given key
 * @param {string} key - Translation key in dot notation (e.g., 'page.title')
 * @param {object} params - Parameters to replace in translation string (e.g., {current: 1, total: 3})
 * @returns {string} Translated text or key if translation not found
 */
function t(key, params = {}) {
  const keys = key.split('.');
  let value = translations[currentLanguage];
  
  // Navigate through nested translation object
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      console.warn(`Translation key not found: ${key} for language: ${currentLanguage}`);
      return key; // Return the key itself if translation not found
    }
  }
  
  // Replace parameters in the translation string (e.g., {current} → 1)
  if (typeof value === 'string' && Object.keys(params).length > 0) {
    return value.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  }
  
  return value;
}

/**
 * Switches the application language and updates all UI elements
 * @param {string} newLang - Language code ('tr' or 'en')
 */
function switchLanguage(newLang) {
  if (translations[newLang]) {
    currentLanguage = newLang;
    localStorage.setItem('preferredLanguage', newLang); // Persist language choice
    updateUILanguage();
    console.log(`Language switched to: ${newLang}`);
  }
}

// ==================== UI LANGUAGE UPDATES ====================

/**
 * Updates all UI elements with current language translations
 * Called when language is switched or application is loaded
 */
function updateUILanguage() {
  // Update page title
  document.title = t('page.title') + ' - ' + t('steps.step1.title');
  
  // Update header title
  const headerTitle = document.querySelector('.wizard-header h1');
  if (headerTitle) {
    headerTitle.textContent = t('page.title');
  }
  
  // Update step counter
  updateStepCounter();
  
  // Update step titles and instructions
  updateStepTitles();
  
  // Update form labels and options
  updateFormLabels();
  
  // Update buttons
  updateButtonLabels();
  
  // Update language switcher
  updateLanguageSwitcher();
  
  // Update loading text
  updateLoadingText();
  
  // Update disclaimer text
  updateDisclaimer();
  
  // If results are visible, update them
  if (!document.getElementById('results-section').classList.contains('hidden')) {
    // Re-trigger result display with current selections
    calculateResults();
  }
}

/**
 * Updates the step counter display in the header
 */
function updateStepCounter() {
  const stepCounter = document.getElementById('step-counter');
  if (stepCounter) {
    stepCounter.textContent = t('page.stepCounter', { current: currentStep, total: maxSteps });
  }
}

/**
 * Updates step titles and instruction text for all wizard steps
 */
function updateStepTitles() {
  const steps = ['step1', 'step2', 'step3'];
  steps.forEach((stepKey, index) => {
    const stepNum = index + 1;
    const stepElement = document.getElementById(`step-${stepNum}`);
    if (stepElement) {
      const titleElement = stepElement.querySelector('h2');
      if (titleElement) {
        const instructionSpan = titleElement.querySelector('.step-instruction');
        titleElement.firstChild.textContent = t(`steps.${stepKey}.title`) + ' ';
        if (instructionSpan) {
          instructionSpan.textContent = t(`steps.${stepKey}.instruction`);
        }
      }
    }
  });
}

/**
 * Updates form field labels and tooltips (no longer used since labels were removed)
 * Kept for future extensibility
 */
function updateFormLabels() {
  const fieldIds = [
    'admitYear', 'academicProgram', 'admitType', 'lysScholarship',
    'waivers', 'siblingDiscount', 'citizenship', 'paymentMethods'
  ];
  
  fieldIds.forEach(fieldId => {
    const select = document.getElementById(fieldId);
    if (select) {
      select.title = t(`fields.${fieldId}.title`);
    }
  });
}

/**
 * Updates all button labels throughout the application
 */
function updateButtonLabels() {
  const buttonMappings = [
    { id: 'step1-next', key: 'buttons.next' },
    { id: 'step2-next', key: 'buttons.next' },
    { id: 'step3-next', key: 'buttons.calculate' },
    { selector: 'button[onclick="prevStep()"]', key: 'buttons.back' },
    { selector: 'button[onclick="startOver()"]', key: 'buttons.startOver' },
    { selector: 'button[onclick="testGoogleAppsScript()"]', key: 'buttons.testFile' }
  ];
  
  buttonMappings.forEach(mapping => {
    let button;
    if (mapping.id) {
      button = document.getElementById(mapping.id);
    } else if (mapping.selector) {
      button = document.querySelector(mapping.selector);
    }
    
    if (button) {
      button.textContent = t(mapping.key);
    }
  });
}

/**
 * Updates loading indicator text
 */
function updateLoadingText() {
  const loadingText = document.querySelector('#loading-indicator p');
  if (loadingText) {
    loadingText.textContent = t('loading.title');
  }
  
  // Update troubleshooting section
  const troubleshootingTitle = document.querySelector('.troubleshooting summary');
  if (troubleshootingTitle) {
    troubleshootingTitle.textContent = t('loading.troubleshooting.title');
  }
}

/**
 * Adds language switcher button to the header controls
 */
function addLanguageSwitcher() {
  const headerControls = document.querySelector('.header-controls');
  if (headerControls && !document.getElementById('language-switcher')) {
    const languageSwitcher = document.createElement('button');
    languageSwitcher.id = 'language-switcher';
    languageSwitcher.className = 'language-switcher';
    languageSwitcher.onclick = () => {
      const newLang = currentLanguage === 'tr' ? 'en' : 'tr';
      switchLanguage(newLang);
    };
    headerControls.appendChild(languageSwitcher);
  }
}

/**
 * Updates language switcher button text
 */
function updateLanguageSwitcher() {
  const switcher = document.getElementById('language-switcher');
  if (switcher) {
    switcher.textContent = t('language.switch');
  }
}

/**
 * Updates legal disclaimer text
 */
function updateDisclaimer() {
  const disclaimer = document.getElementById('disclaimer');
  if (disclaimer) {
    disclaimer.textContent = t('disclaimer.text');
  }
}

// ==================== DATA LOADING AND POPULATION ====================

/**
 * Loads tuition fee data from the local JSON file
 * Attempts to fetch from assets/fees.json with error handling
 * Falls back to hardcoded data if file cannot be accessed
 * This is the main data initialization function
 */
async function loadTuitionData() {
  try {
    console.log('Attempting to fetch data from:', DATA_URL);
    
    const response = await fetch(DATA_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    console.log('Raw response text (first 200 chars):', text.substring(0, 200));
    
    tuitionData = JSON.parse(text);
    console.log('Tuition data loaded successfully:', tuitionData.length, 'records');
    console.log('Sample record:', tuitionData[0]);
    
    // Validate data structure - ensure we have an array with records
    if (!Array.isArray(tuitionData) || tuitionData.length === 0) {
      throw new Error('Invalid data format: Expected non-empty array');
    }
    
    // Filter out incomplete records (missing core required fields)
    const originalLength = tuitionData.length;
    tuitionData = tuitionData.filter(item => 
      item.Admit_Year && item.Academic_Program && item.Admit_Type && 
      item.Citizenship
      // Only validate core fields that exist in the JSON structure
    );
    
    console.log(`Filtered tuition data: ${tuitionData.length} valid records (from ${originalLength} total)`);
    
    // Initialize dropdown menus with the loaded data
    populateDropdowns();
  } catch (error) {
    console.error('Detailed error loading tuition data:', error);
    
    // Provide specific error messages based on error type
    let errorMessage = 'Veri yüklenirken hata oluştu: ';
    if (error.message.includes('Failed to fetch')) {
      errorMessage += 'assets/fees.json dosyası bulunamadı veya erişilemedi. Dosyanın doğru konumda olduğundan emin olun. ';
    } else if (error.message.includes('HTTP error')) {
      errorMessage += `Dosya okuma hatası (${error.message}). `;
    } else if (error.message.includes('Invalid data format')) {
      errorMessage += 'JSON veri formatı geçersiz. ';
    } else {
      errorMessage += error.message + '. ';
    }
    
    errorMessage += 'Fallback verilerle devam ediliyor...';
    
    console.log('Error details for debugging:');
    console.log('- URL:', DATA_URL);
    console.log('- Error type:', error.constructor.name);
    console.log('- Error message:', error.message);
    console.log('- Stack:', error.stack);
    
    alert(errorMessage);
    
    // Load fallback data to allow testing when JSON file is not available
    loadFallbackData();
  }
}

/**
 * Provides hardcoded fallback data when the JSON file cannot be loaded
 * Contains sample records for testing purposes
 * Used when assets/fees.json is not accessible (e.g., CORS issues)
 */
function loadFallbackData() {
  console.log('Loading fallback data...');
  tuitionData = [
    {
      "Admit_Year": 2024,
      "Academic_Program": "Other",
      "Admit_Type": "LYS",
      "Citizenship": "Turkish Citizen",
      "Tuition_Fee": 1565000,
      "Tuition_Fall": 782500,
      "Tuition_Spring": 899875,
      "Currency": "Turkish Lira"
    },
    {
      "Admit_Year": 2024,
      "Academic_Program": "School of Medicine",
      "Admit_Type": "LYS",
      "Citizenship": "Turkish Citizen",
      "Tuition_Fee": 2330000,
      "Tuition_Fall": 1165000,
      "Tuition_Spring": 1339750,
      "Currency": "Turkish Lira"
    },
    {
      "Admit_Year": 2024,
      "Academic_Program": "Other",
      "Admit_Type": "International",
      "Citizenship": "Other",
      "Tuition_Fee": 28000,
      "Tuition_Fall": 14000,
      "Tuition_Spring": 14000,
      "Currency": "US Dollar"
    }
  ];
  
  console.log('Fallback data loaded:', tuitionData);
  populateDropdowns();
}

// Test function to manually check local JSON file connection
async function testGoogleAppsScript() {
  console.log('🔍 Testing local JSON file connection...');
  
  const diagnostics = {
    url: DATA_URL,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    tests: []
  };
  
  // Test: Local JSON file connectivity
  try {
    console.log('Test: Local JSON file fetch test...');
    const response = await fetch(DATA_URL, {
      method: 'GET',
    });
    
    diagnostics.tests.push({
      name: 'Local JSON Fetch',
      status: 'SUCCESS',
      details: {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        type: response.type,
        url: response.url
      }
    });
    
    const text = await response.text();
    console.log('Response text (first 500 chars):', text.substring(0, 500));
    
    try {
      const data = JSON.parse(text);
      console.log('✅ JSON parsing successful, records found:', data.length);
      
      // Filter valid records - only check core fields that exist in JSON
      const validData = data.filter(item => 
        item.Admit_Year && item.Academic_Program && item.Admit_Type && 
        item.Citizenship
      );
      
      diagnostics.tests.push({
        name: 'JSON Parsing',
        status: 'SUCCESS',
        details: {
          totalRecords: data.length,
          validRecords: validData.length,
          sampleRecord: validData[0] || null
        }
      });
      
      alert(`✅ Bağlantı başarılı!\n\n📊 Toplam ${data.length} kayıt bulundu\n✅ Geçerli ${validData.length} kayıt\n� Dosya: ${DATA_URL}\n⏰ Test zamanı: ${new Date().toLocaleString('tr-TR')}`);
      
      // Use the successfully loaded data
      tuitionData = validData;
      populateDropdowns();
      
    } catch (parseError) {
      diagnostics.tests.push({
        name: 'JSON Parsing',
        status: 'FAILED',
        error: parseError.message,
        rawResponse: text.substring(0, 200)
      });
      
      console.error('❌ JSON parsing failed:', parseError);
      alert(`❌ JSON çözümleme hatası:\n${parseError.message}\n\nHam yanıt (ilk 200 karakter):\n${text.substring(0, 200)}`);
    }
    
  } catch (error) {
    diagnostics.tests.push({
      name: 'Local JSON Fetch',
      status: 'FAILED',
      error: error.message,
      errorType: error.constructor.name
    });
    
    console.error('❌ Connection test failed:', error);
    
    let errorAnalysis = '❌ Dosya bağlantı testi başarısız:\n\n';        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorAnalysis += '🚫 Dosya Erişim Hatası:\n';
          errorAnalysis += '• assets/fees.json dosyası bulunamadı\n';
      errorAnalysis += '• Dosya yolu yanlış\n';
      errorAnalysis += '• Web sunucusu çalışmıyor\n';
      errorAnalysis += '• CORS kısıtlaması (file:// protokolü)\n\n';
      errorAnalysis += '✅ Çözüm Önerileri:\n';
      errorAnalysis += '1. Dosyanın doğru konumda olduğunu kontrol edin\n';
      errorAnalysis += '2. Web sunucusu üzerinden çalıştırın (localhost)\n';
      errorAnalysis += '3. Live Server uzantısını kullanın\n';
      errorAnalysis += '4. Dosya izinlerini kontrol edin';
    } else {
      errorAnalysis += `Hata türü: ${error.name}\n`;
      errorAnalysis += `Hata mesajı: ${error.message}`;
    }
    
    alert(errorAnalysis);
  }
  
  // Log full diagnostics
  console.log('🔍 Full diagnostics report:', diagnostics);
  
  console.log('💡 Troubleshooting tips:');
  console.log('1. Make sure fees.json is in the assets directory');
  console.log('2. Use a web server (localhost) instead of opening file:// directly');
  console.log('3. Check browser console for detailed error messages');
  console.log('4. Verify JSON file syntax is valid');
}

// Get unique values for a specific field from the data
function getUniqueValues(field) {
  const values = tuitionData
    .map(item => item[field])
    .filter(value => value && value !== "")
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort();
  return values;
}

// Filter data based on current selections
function getFilteredData() {
  let filtered = tuitionData.filter(item => {
    // Only return items that have core required fields that exist in JSON
    return item.Admit_Year && item.Academic_Program && item.Admit_Type && 
           item.Citizenship && 
           (item.Tuition_Fee || item.Tuition_Fall || item.Tuition_Spring); // At least one fee must exist
  });

  // Apply filters based on current selections - only for fields that exist in JSON
  const admitYear = document.getElementById('admitYear').value;
  const academicProgram = document.getElementById('academicProgram').value;
  const admitType = document.getElementById('admitType').value;
  const citizenship = document.getElementById('citizenship').value;

  if (admitYear) filtered = filtered.filter(item => item.Admit_Year == admitYear);
  if (academicProgram) filtered = filtered.filter(item => item.Academic_Program === academicProgram);
  if (admitType) filtered = filtered.filter(item => item.Admit_Type === admitType);
  if (citizenship) filtered = filtered.filter(item => item.Citizenship === citizenship);

  return filtered;
}    // Predefined options for specific fields - these are the data values, translations handled separately
    const PREDEFINED_OPTIONS = {
      lysScholarship: ['None', '25%', '50%', '75%'],
      waivers: ['None', 'Koç Group Retiree', 'Koç Group Employee', 'Koç University Employee', 'Koç University Retiree'],
      siblingDiscount: ['No', 'Yes'],
      paymentMethods: ['Installment', 'Single Payment']
    };

    // Populate dropdowns based on current data
    function populateDropdowns() {
      // Hide loading indicator and show form
      document.getElementById('loading-indicator').style.display = 'none';
      document.getElementById('form-content').classList.remove('form-content-hidden');
      
      // Populate initial dropdowns with the new order - use full dataset for year
      populateDropdown('admitYear', 'Admit_Year', tuitionData);
      populateDropdown('academicProgram', 'Academic_Program', tuitionData);
      populateDropdown('admitType', 'Admit_Type', tuitionData);
      
      // Populate predefined options for step 2 and 3 fields
      populatePredefinedOptions('lysScholarship', PREDEFINED_OPTIONS.lysScholarship);
      populatePredefinedOptions('waivers', PREDEFINED_OPTIONS.waivers);
      populatePredefinedOptions('siblingDiscount', PREDEFINED_OPTIONS.siblingDiscount);
      populatePredefinedOptions('paymentMethods', PREDEFINED_OPTIONS.paymentMethods);
      
      // Don't call updateDependentDropdowns here as it will override the year dropdown
      // updateDependentDropdowns();
    }

    // Populate a dropdown with predefined options using translations
    function populatePredefinedOptions(elementId, options) {
      const select = document.getElementById(elementId);
      const currentValue = select.value;
      
      console.log(`Populating ${elementId} with predefined options:`, options);
      
      // Clear current options except the first one
      select.innerHTML = `<option value="">${t(`fields.${elementId}.placeholder`)}</option>`;
      
      options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        
        // Get translation for the option, fallback to original value
        const translationKey = `fields.${elementId}.options.${option}`;
        const translatedText = t(translationKey);
        optionElement.textContent = translatedText !== translationKey ? translatedText : option;
        
        if (option === currentValue) {
          optionElement.selected = true;
          console.log(`Preserving selection: ${option} for ${elementId}`);
        }
        select.appendChild(optionElement);
      });
    }

    // Populate a specific dropdown
function populateDropdown(elementId, field, filtered = null) {
  const select = document.getElementById(elementId);
  const currentValue = select.value;
  
  console.log(`Populating ${elementId} with field ${field}, current value: ${currentValue}`);
  
  // Clear current options except the first one
  select.innerHTML = `<option value="">${t(`fields.${elementId}.placeholder`)}</option>`;
  
  const data = filtered || tuitionData;
  const values = data
    .map(item => item[field])
    .filter(value => value && value !== "" && value !== null && value !== undefined)
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort((a, b) => {
      // Sort numbers numerically, strings alphabetically
      if (typeof a === 'number' && typeof b === 'number') {
        return b - a; // Descending for years (2025, 2024, etc.)
      }
      return a.toString().localeCompare(b.toString());
    });

  console.log(`Found ${values.length} values for ${elementId}:`, values);

  values.forEach(value => {
    const option = document.createElement('option');
    option.value = value;
    
    // Get translation for the option if available, otherwise use original value
    const translationKey = `fields.${elementId}.options.${value}`;
    const translatedText = t(translationKey);
    option.textContent = translatedText !== translationKey ? translatedText : value;
    
    if (value == currentValue) { // Use == to handle string/number comparison
      option.selected = true;
      console.log(`Preserving selection: ${value} for ${elementId}`);
    }
    select.appendChild(option);
  });
  
  // If we had a value but it's no longer available, clear it
  if (currentValue && !values.includes(currentValue) && !values.includes(parseInt(currentValue))) {
    select.value = '';
    console.log(`Cleared invalid selection: ${currentValue} for ${elementId}`);
  }
}    // Update dependent dropdowns based on current selections
    function updateDependentDropdowns() {
      const filtered = getFilteredData();
      
      // Update dropdowns based on current step and selections
      if (currentStep >= 1) {
        // Don't repopulate year dropdown to preserve user selection
        // Only populate if it's completely empty
        const yearDropdown = document.getElementById('admitYear');
        if (yearDropdown.options.length <= 1) {
          populateDropdown('admitYear', 'Admit_Year', tuitionData);
        }
        
        populateDropdown('academicProgram', 'Academic_Program', getFilteredData());
        populateDropdown('admitType', 'Admit_Type', getFilteredData());
        
        // Handle LYS scholarship conditional logic
        handleLYSScholarshipVisibility();
      }
      if (currentStep >= 2) {
        // Use predefined options for these fields instead of reading from JSON
        populatePredefinedOptions('waivers', PREDEFINED_OPTIONS.waivers);
        populatePredefinedOptions('siblingDiscount', PREDEFINED_OPTIONS.siblingDiscount);
        
        // Only populate LYS scholarship if it's visible
        if (!document.getElementById('lys-scholarship-section').classList.contains('hidden')) {
          populatePredefinedOptions('lysScholarship', PREDEFINED_OPTIONS.lysScholarship);
        }
      }
      if (currentStep >= 3) {
        // Use a less restrictive filter for citizenship - only filter by completed selections
        const citizenshipFilteredData = tuitionData.filter(item => {
          const admitYear = document.getElementById('admitYear').value;
          const academicProgram = document.getElementById('academicProgram').value;
          const admitType = document.getElementById('admitType').value;
          
          let matches = true;
          if (admitYear) matches = matches && item.Admit_Year == admitYear;
          if (academicProgram) matches = matches && item.Academic_Program === academicProgram;
          if (admitType) matches = matches && item.Admit_Type === admitType;
          
          return matches && item.Citizenship; // Only require citizenship field to exist
        });
        
        populateDropdown('citizenship', 'Citizenship', citizenshipFilteredData);
        populatePredefinedOptions('paymentMethods', PREDEFINED_OPTIONS.paymentMethods);
      }
    }

// Handle LYS scholarship section visibility
function handleLYSScholarshipVisibility() {
  const admitType = document.getElementById('admitType').value;
  const lysSection = document.getElementById('lys-scholarship-section');
  const lysSelect = document.getElementById('lysScholarship');
  
  if (admitType === 'LYS') {
    lysSection.classList.remove('hidden');
  } else {
    lysSection.classList.add('hidden');
    lysSelect.value = ''; // Clear selection when hidden
  }
}

// Step navigation functions
function nextStep() {
  if (currentStep < maxSteps) {
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.getElementById(`progress-${currentStep}`).classList.add('active');
    currentStep++;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    // Update step counter in header with translation
    updateStepCounter();
    
    updateDependentDropdowns();
    updateStepButtons();
  }
}

function prevStep() {
  if (currentStep > 1) {
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    document.getElementById(`progress-${currentStep}`).classList.remove('active');
    currentStep--;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    
    // Update step counter in header with translation
    updateStepCounter();
    
    updateStepButtons();
  }
}

// Calculate and display results
function calculateResults() {
  const selections = {
    admitYear: document.getElementById('admitYear').value,
    academicProgram: document.getElementById('academicProgram').value,
    admitType: document.getElementById('admitType').value,
    lysScholarship: document.getElementById('lysScholarship').value || 'None',
    waivers: document.getElementById('waivers').value,
    siblingDiscount: document.getElementById('siblingDiscount').value,
    citizenship: document.getElementById('citizenship').value,
    paymentMethods: document.getElementById('paymentMethods').value
  };

  // Find matching tuition data - only match fields that exist in JSON
  const matchingData = tuitionData.find(item => 
    item.Admit_Year == selections.admitYear &&
    item.Academic_Program === selections.academicProgram &&
    item.Admit_Type === selections.admitType &&
    item.Citizenship === selections.citizenship
    // Removed LYS_Scholarship, Waivers, Sibling_Discount, Payment_Methods from matching
    // These will be handled in JavaScript for calculations
  );

  displayResults(selections, matchingData);
}

function startOver() {
  // Reset to step 1
  document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
  document.querySelectorAll('.progress-step').forEach(progress => progress.classList.remove('active'));
  
  currentStep = 1;
  document.getElementById('step-1').classList.add('active');
  document.getElementById('progress-1').classList.add('active');
  
  // Update step counter in header with translation
  updateStepCounter();
  
  // Reset form values
  document.getElementById('admitYear').value = '';
  document.getElementById('academicProgram').value = '';
  document.getElementById('admitType').value = '';
  document.getElementById('lysScholarship').value = '';
  document.getElementById('waivers').value = '';
  document.getElementById('siblingDiscount').value = '';
  document.getElementById('citizenship').value = '';
  document.getElementById('paymentMethods').value = '';
  
  // Hide results and LYS section
  document.getElementById('results-section').classList.add('hidden');
  document.getElementById('lys-scholarship-section').classList.add('hidden');
  
  // Reset buttons
  updateStepButtons();
  
  // Repopulate dropdowns with current language
  populateDropdowns();
}

// Update step buttons based on current selections
function updateStepButtons() {
  const buttons = [
    { 
      step: 1, 
      element: 'step1-next', 
      fields: ['admitYear', 'academicProgram', 'admitType'] 
    },
    { 
      step: 2, 
      element: 'step2-next', 
      fields: ['waivers', 'siblingDiscount'],
      conditionalFields: [
        { condition: () => document.getElementById('admitType').value === 'LYS', field: 'lysScholarship' }
      ]
    },
    { 
      step: 3, 
      element: 'step3-next', 
      fields: ['citizenship', 'paymentMethods'] 
    }
  ];

  buttons.forEach(button => {
    const buttonElement = document.getElementById(button.element);
    if (buttonElement) {
      let allSelected = true;

      // Check required fields
      if (button.fields) {
        allSelected = button.fields.every(field => 
          document.getElementById(field).value !== ''
        );
      }

      // Check conditional fields
      if (allSelected && button.conditionalFields) {
        button.conditionalFields.forEach(conditional => {
          if (conditional.condition()) {
            allSelected = allSelected && document.getElementById(conditional.field).value !== '';
          }
        });
      }

      buttonElement.disabled = !allSelected;
    }
  });
}

// Display final results with conditional payment display and discount calculations
function displayResults(selections, matchingData) {
  let resultsHTML = '';
  
  if (matchingData) {
    const currency = matchingData.Currency;
    const currencySymbol = currency === 'Turkish Lira' ? 'TL' : 
                          currency === 'US Dollar' ? 'USD' : currency;
    const paymentMethod = selections.paymentMethods;
    
    // Step 1: Get base tuition fees
    let baseTuitionFee = matchingData.Tuition_Fee;
    let baseTuitionFall = matchingData.Tuition_Fall;
    let baseTuitionSpring = matchingData.Tuition_Spring;
    
    // Step 2: Calculate LYS Scholarship discount
    let lysDiscountPercentage = 0;
    if (selections.admitType === 'LYS' && selections.lysScholarship !== 'None') {
      switch (selections.lysScholarship) {
        case '25%':
          lysDiscountPercentage = 25;
          break;
        case '50%':
          lysDiscountPercentage = 50;
          break;
        case '75%':
          lysDiscountPercentage = 75;
          break;
        default:
          lysDiscountPercentage = 0;
      }
    }
    
    // Apply LYS discount to base fees
    const lysDiscountAmount = Math.round(baseTuitionFee * (lysDiscountPercentage / 100));
    const afterLysDiscountFee = baseTuitionFee - lysDiscountAmount;
    const afterLysDiscountFall = Math.round(baseTuitionFall * (1 - lysDiscountPercentage / 100));
    const afterLysDiscountSpring = Math.round(baseTuitionSpring * (1 - lysDiscountPercentage / 100));
    
    // Step 3: Calculate Waiver discount
    let waiverDiscountPercentage = 0;
    switch (selections.waivers) {
      case 'Koç Group Retiree':
        waiverDiscountPercentage = 10;
        break;
      case 'Koç Group Employee':
        waiverDiscountPercentage = 10;
        break;
      case 'Koç University Employee':
        waiverDiscountPercentage = 50;
        break;
      case 'Koç University Retiree':
        waiverDiscountPercentage = 20;
        break;
      default:
        waiverDiscountPercentage = 0;
    }
    
    // Apply waiver discount to fees after LYS discount
    const waiverDiscountAmount = Math.round(afterLysDiscountFee * (waiverDiscountPercentage / 100));
    const afterWaiverDiscountFee = afterLysDiscountFee - waiverDiscountAmount;
    const afterWaiverDiscountFall = Math.round(afterLysDiscountFall * (1 - waiverDiscountPercentage / 100));
    const afterWaiverDiscountSpring = Math.round(afterLysDiscountSpring * (1 - waiverDiscountPercentage / 100));
    
    // Step 4: Calculate Sibling discount
    let siblingDiscountPercentage = 0;
    if (selections.siblingDiscount === 'Yes') {
      siblingDiscountPercentage = 5;
    }
    
    // Apply sibling discount to fees after waiver discount
    const siblingDiscountAmount = Math.round(afterWaiverDiscountFee * (siblingDiscountPercentage / 100));
    const finalTuitionFee = afterWaiverDiscountFee - siblingDiscountAmount;
    const finalTuitionFall = Math.round(afterWaiverDiscountFall * (1 - siblingDiscountPercentage / 100));
    const finalTuitionSpring = Math.round(afterWaiverDiscountSpring * (1 - siblingDiscountPercentage / 100));
    
    // Calculate total discounts
    const totalDiscountAmount = baseTuitionFee - finalTuitionFee;
    const totalDiscountPercentage = Math.round((totalDiscountAmount / baseTuitionFee) * 100);

    // Helper function to get translated option value
    const getTranslatedOption = (fieldKey, value) => {
      const translationKey = `fields.${fieldKey}.options.${value}`;
      const translated = t(translationKey);
      return translated !== translationKey ? translated : value;
    };

    resultsHTML = `
      <div class="result-item">
        <span>${t('results.fields.admitYear')}:</span>
        <span>${selections.admitYear}</span>
      </div>
      <div class="result-item">
        <span>${t('results.fields.academicProgram')}:</span>
        <span>${getTranslatedOption('academicProgram', selections.academicProgram)}</span>
      </div>
      <div class="result-item">
        <span>${t('results.fields.admitType')}:</span>
        <span>${getTranslatedOption('admitType', selections.admitType)}</span>
      </div>`;

    // Show LYS scholarship only if applicable
    if (selections.admitType === 'LYS') {
      resultsHTML += `
      <div class="result-item">
        <span>${t('results.fields.lysScholarship')}:</span>
        <span>${getTranslatedOption('lysScholarship', selections.lysScholarship)}</span>
      </div>`;
    }

    resultsHTML += `
      <div class="result-item">
        <span>${t('results.fields.waivers')}:</span>
        <span>${getTranslatedOption('waivers', selections.waivers)}</span>
      </div>
      <div class="result-item">
        <span>${t('results.fields.siblingDiscount')}:</span>
        <span>${getTranslatedOption('siblingDiscount', selections.siblingDiscount)}</span>
      </div>
      <div class="result-item">
        <span>${t('results.fields.citizenship')}:</span>
        <span>${getTranslatedOption('citizenship', selections.citizenship)}</span>
      </div>
      <div class="result-item">
        <span>${t('results.fields.paymentMethods')}:</span>
        <span>${getTranslatedOption('paymentMethods', selections.paymentMethods)}</span>
      </div>`;

    // Show discount breakdown if there are any discounts
    if (totalDiscountAmount > 0) {
      resultsHTML += `
      <div class="result-item">
        <span>${t('results.fields.originalFee')}:</span>
        <span>${baseTuitionFee.toLocaleString()} ${currencySymbol}</span>
      </div>`;
      
      if (lysDiscountPercentage > 0) {
        resultsHTML += `
        <div class="result-item">
          <span>${t('results.fields.lysDiscount')} (${lysDiscountPercentage}%):</span>
          <span>-${lysDiscountAmount.toLocaleString()} ${currencySymbol}</span>
        </div>`;
      }
      
      if (waiverDiscountPercentage > 0) {
        resultsHTML += `
        <div class="result-item">
          <span>${t('results.fields.waiverDiscount')} (${waiverDiscountPercentage}%):</span>
          <span>-${waiverDiscountAmount.toLocaleString()} ${currencySymbol}</span>
        </div>`;
      }
      
      if (siblingDiscountPercentage > 0) {
        resultsHTML += `
        <div class="result-item">
          <span>${t('results.fields.siblingDiscountLabel')} (${siblingDiscountPercentage}%):</span>
          <span>-${siblingDiscountAmount.toLocaleString()} ${currencySymbol}</span>
        </div>`;
      }
      
      resultsHTML += `
      <div class="result-item">
        <span>${t('results.fields.totalDiscount')} (${totalDiscountPercentage}%):</span>
        <span>-${totalDiscountAmount.toLocaleString()} ${currencySymbol}</span>
      </div>`;
    }

    // Conditional payment display based on payment method
    if (paymentMethod === 'Single Payment') {
      resultsHTML += `
      <div class="result-item">
        <span>${t('results.fields.totalTuitionFee')}:</span>
        <span>${finalTuitionFee.toLocaleString()} ${currencySymbol}</span>
      </div>`;
    } else if (paymentMethod === 'Installment') {
      // Check if installment data is available
      if (baseTuitionFall !== "NA" && baseTuitionSpring !== "NA" && 
          baseTuitionFall !== null && baseTuitionSpring !== null &&
          typeof baseTuitionFall === 'number' && typeof baseTuitionSpring === 'number') {
        
        resultsHTML += `
        <div class="result-item">
          <span>${t('results.fields.fallSemesterFee')}:</span>
          <span>${finalTuitionFall.toLocaleString()} ${currencySymbol}</span>
        </div>
        <div class="result-item">
          <span>${t('results.fields.springSemesterFee')}:</span>
          <span>${finalTuitionSpring.toLocaleString()} ${currencySymbol}</span>
        </div>
        <div class="result-item">
          <span>${t('results.fields.totalAnnualFee')}:</span>
          <span>${(finalTuitionFall + finalTuitionSpring).toLocaleString()} ${currencySymbol}</span>
        </div>`;
      } else {
        // Fallback to single payment if installment data is not available
        resultsHTML += `
        <div class="result-item">
          <span>${t('results.fields.totalTuitionFee')}:</span>
          <span>${finalTuitionFee.toLocaleString()} ${currencySymbol}</span>
        </div>
        <div class="result-item">
          <span>${t('results.fields.note')}:</span>
          <span>${t('results.fields.installmentNotAvailable')}</span>
        </div>`;
      }
    }
  } else {
    resultsHTML = `
      <div class="result-item">
        <span>${t('results.warning')}:</span>
        <span>${t('results.noDataFound')}</span>
      </div>
    `;
  }
  
  // Update results section title and subtitle
  const resultsTitle = document.querySelector('#results-section h2');
  const resultsSubtitle = document.querySelector('#results-section p');
  if (resultsTitle) resultsTitle.textContent = t('results.title');
  if (resultsSubtitle) resultsSubtitle.textContent = t('results.subtitle');
  
  document.getElementById('resultSummary').innerHTML = resultsHTML;
  document.getElementById('results-section').classList.remove('hidden');
}

// Event listeners for form validation and dependent updates
function setupEventListeners() {
  const fields = [
    'admitYear', 'academicProgram', 'admitType', 'lysScholarship', 
    'waivers', 'siblingDiscount', 'citizenship', 'paymentMethods'
  ];

  fields.forEach(fieldId => {
    const element = document.getElementById(fieldId);
    if (element) {
      element.addEventListener('change', function() {
        console.log(`Field ${fieldId} changed to:`, this.value);
        
        // Handle LYS scholarship visibility when admit type changes
        if (fieldId === 'admitType') {
          handleLYSScholarshipVisibility();
        }
        
        // Update dependent dropdowns and handle LYS visibility for other field changes too
        if (fieldId === 'waivers' || fieldId === 'siblingDiscount') {
          // Make sure LYS scholarship visibility is correct after waiver/sibling changes
          handleLYSScholarshipVisibility();
        }
        
        // Only update dependent dropdowns if not changing the year
        // Year dropdown should remain stable with all options
        if (fieldId !== 'admitYear') {
          updateDependentDropdowns();
        } else {
          // For year changes, only update other dropdowns
          populateDropdown('academicProgram', 'Academic_Program', getFilteredData());
          populateDropdown('admitType', 'Admit_Type', getFilteredData());
        }
        
        updateStepButtons();
      });
    }
  });
}

// Initialize the wizard
document.addEventListener('DOMContentLoaded', async function() {
  // Load preferred language from localStorage
  const savedLanguage = localStorage.getItem('preferredLanguage');
  if (savedLanguage && ['tr', 'en'].includes(savedLanguage)) {
    currentLanguage = savedLanguage;
  }
  
  // Load translations first
  await loadTranslations();
  
  // Add language switcher to header
  addLanguageSwitcher();
  
  // Load tuition data and set up the application
  await loadTuitionData();
  
  // Apply current language to UI
  updateUILanguage();
  
  // Set up event listeners
  setupEventListeners();
  updateStepButtons();
});
