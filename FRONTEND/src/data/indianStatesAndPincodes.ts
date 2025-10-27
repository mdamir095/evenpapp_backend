export interface StateOption {
  value: string;
  label: string;
  cities: CityOption[];
}

export interface CityOption {
  value: string;
  label: string;
  pincodes: string[];
}

export interface DropdownOption {
  value: string;
  label: string;
}

// Complete data structure with all Indian states and cities
export const indianStates: StateOption[] = [
  {
    value: 'andhra-pradesh',
    label: 'Andhra Pradesh',
    cities: [
      { value: 'visakhapatnam', label: 'Visakhapatnam', pincodes: ['530001', '530002', '530003', '530004', '530005'] },
      { value: 'vijayawada', label: 'Vijayawada', pincodes: ['520001', '520002', '520003', '520004', '520005'] },
      { value: 'guntur', label: 'Guntur', pincodes: ['522001', '522002', '522003', '522004', '522005'] },
      { value: 'nellore', label: 'Nellore', pincodes: ['524001', '524002', '524003', '524004', '524005'] },
      { value: 'kurnool', label: 'Kurnool', pincodes: ['518001', '518002', '518003', '518004', '518005'] }
    ]
  },
  {
    value: 'arunachal-pradesh',
    label: 'Arunachal Pradesh',
    cities: [
      { value: 'itanagar', label: 'Itanagar', pincodes: ['791111', '791112', '791113', '791114', '791115'] },
      { value: 'naharlagun', label: 'Naharlagun', pincodes: ['791110', '791116', '791117', '791118', '791119'] }
    ]
  },
  {
    value: 'assam',
    label: 'Assam',
    cities: [
      { value: 'guwahati', label: 'Guwahati', pincodes: ['781001', '781002', '781003', '781004', '781005'] },
      { value: 'silchar', label: 'Silchar', pincodes: ['788001', '788002', '788003', '788004', '788005'] },
      { value: 'dibrugarh', label: 'Dibrugarh', pincodes: ['786001', '786002', '786003', '786004', '786005'] },
      { value: 'jorhat', label: 'Jorhat', pincodes: ['785001', '785002', '785003', '785004', '785005'] }
    ]
  },
  {
    value: 'bihar',
    label: 'Bihar',
    cities: [
      { value: 'patna', label: 'Patna', pincodes: ['800001', '800002', '800003', '800004', '800005'] },
      { value: 'gaya', label: 'Gaya', pincodes: ['823001', '823002', '823003', '823004', '823005'] },
      { value: 'bhagalpur', label: 'Bhagalpur', pincodes: ['812001', '812002', '812003', '812004', '812005'] },
      { value: 'muzaffarpur', label: 'Muzaffarpur', pincodes: ['842001', '842002', '842003', '842004', '842005'] }
    ]
  },
  {
    value: 'chhattisgarh',
    label: 'Chhattisgarh',
    cities: [
      { value: 'raipur', label: 'Raipur', pincodes: ['492001', '492002', '492003', '492004', '492005'] },
      { value: 'bhilai', label: 'Bhilai', pincodes: ['490001', '490002', '490003', '490004', '490005'] },
      { value: 'bilaspur', label: 'Bilaspur', pincodes: ['495001', '495002', '495003', '495004', '495005'] },
      { value: 'korba', label: 'Korba', pincodes: ['495677', '495678', '495679', '495680', '495681'] }
    ]
  },
  {
    value: 'delhi',
    label: 'Delhi',
    cities: [
      { value: 'new-delhi', label: 'New Delhi', pincodes: ['110001', '110002', '110003', '110004', '110005'] },
      { value: 'delhi', label: 'Delhi', pincodes: ['110006', '110007', '110008', '110009', '110010'] },
      { value: 'north-delhi', label: 'North Delhi', pincodes: ['110011', '110012', '110013', '110014', '110015'] },
      { value: 'south-delhi', label: 'South Delhi', pincodes: ['110016', '110017', '110018', '110019', '110020'] }
    ]
  },
  {
    value: 'goa',
    label: 'Goa',
    cities: [
      { value: 'panaji', label: 'Panaji', pincodes: ['403001', '403002', '403003', '403004', '403005'] },
      { value: 'margao', label: 'Margao', pincodes: ['403601', '403602', '403603', '403604', '403605'] },
      { value: 'vasco-da-gama', label: 'Vasco da Gama', pincodes: ['403802', '403803', '403804', '403805', '403806'] }
    ]
  },
  {
    value: 'gujarat',
    label: 'Gujarat',
    cities: [
      { value: 'ahmedabad', label: 'Ahmedabad', pincodes: ['380001', '380002', '380003', '380004', '380005'] },
      { value: 'surat', label: 'Surat', pincodes: ['395001', '395002', '395003', '395004', '395005'] },
      { value: 'vadodara', label: 'Vadodara', pincodes: ['390001', '390002', '390003', '390004', '390005'] },
      { value: 'rajkot', label: 'Rajkot', pincodes: ['360001', '360002', '360003', '360004', '360005'] },
      { value: 'bhavnagar', label: 'Bhavnagar', pincodes: ['364001', '364002', '364003', '364004', '364005'] }
    ]
  },
  {
    value: 'haryana',
    label: 'Haryana',
    cities: [
      { value: 'gurgaon', label: 'Gurgaon', pincodes: ['122001', '122002', '122003', '122004', '122005'] },
      { value: 'faridabad', label: 'Faridabad', pincodes: ['121001', '121002', '121003', '121004', '121005'] },
      { value: 'panipat', label: 'Panipat', pincodes: ['132103', '132104', '132105', '132106', '132107'] },
      { value: 'ambala', label: 'Ambala', pincodes: ['133001', '133002', '133003', '133004', '133005'] }
    ]
  },
  {
    value: 'himachal-pradesh',
    label: 'Himachal Pradesh',
    cities: [
      { value: 'shimla', label: 'Shimla', pincodes: ['171001', '171002', '171003', '171004', '171005'] },
      { value: 'manali', label: 'Manali', pincodes: ['175131', '175132', '175133', '175134', '175135'] },
      { value: 'dharamshala', label: 'Dharamshala', pincodes: ['176215', '176216', '176217', '176218', '176219'] }
    ]
  },
  {
    value: 'jharkhand',
    label: 'Jharkhand',
    cities: [
      { value: 'ranchi', label: 'Ranchi', pincodes: ['834001', '834002', '834003', '834004', '834005'] },
      { value: 'jamshedpur', label: 'Jamshedpur', pincodes: ['831001', '831002', '831003', '831004', '831005'] },
      { value: 'dhanbad', label: 'Dhanbad', pincodes: ['826001', '826002', '826003', '826004', '826005'] },
      { value: 'bokaro', label: 'Bokaro', pincodes: ['827001', '827002', '827003', '827004', '827005'] }
    ]
  },
  {
    value: 'karnataka',
    label: 'Karnataka',
    cities: [
      { value: 'bangalore', label: 'Bangalore', pincodes: ['560001', '560002', '560003', '560004', '560005'] },
      { value: 'mysore', label: 'Mysore', pincodes: ['570001', '570002', '570003', '570004', '570005'] },
      { value: 'mangalore', label: 'Mangalore', pincodes: ['575001', '575002', '575003', '575004', '575005'] },
      { value: 'hubli', label: 'Hubli', pincodes: ['580001', '580002', '580003', '580004', '580005'] },
      { value: 'belgaum', label: 'Belgaum', pincodes: ['590001', '590002', '590003', '590004', '590005'] }
    ]
  },
  {
    value: 'kerala',
    label: 'Kerala',
    cities: [
      { value: 'thiruvananthapuram', label: 'Thiruvananthapuram', pincodes: ['695001', '695002', '695003', '695004', '695005'] },
      { value: 'kochi', label: 'Kochi', pincodes: ['682001', '682002', '682003', '682004', '682005'] },
      { value: 'calicut', label: 'Calicut', pincodes: ['673001', '673002', '673003', '673004', '673005'] },
      { value: 'thrissur', label: 'Thrissur', pincodes: ['680001', '680002', '680003', '680004', '680005'] }
    ]
  },
  {
    value: 'madhya-pradesh',
    label: 'Madhya Pradesh',
    cities: [
      { value: 'bhopal', label: 'Bhopal', pincodes: ['462001', '462002', '462003', '462004', '462005'] },
      { value: 'indore', label: 'Indore', pincodes: ['452001', '452002', '452003', '452004', '452005'] },
      { value: 'jabalpur', label: 'Jabalpur', pincodes: ['482001', '482002', '482003', '482004', '482005'] },
      { value: 'gwalior', label: 'Gwalior', pincodes: ['474001', '474002', '474003', '474004', '474005'] }
    ]
  },
  {
    value: 'maharashtra',
    label: 'Maharashtra',
    cities: [
      { value: 'mumbai', label: 'Mumbai', pincodes: ['400001', '400002', '400003', '400004', '400005'] },
      { value: 'pune', label: 'Pune', pincodes: ['411001', '411002', '411003', '411004', '411005'] },
      { value: 'nagpur', label: 'Nagpur', pincodes: ['440001', '440002', '440003', '440004', '440005'] },
      { value: 'thane', label: 'Thane', pincodes: ['400601', '400602', '400603', '400604', '400605'] },
      { value: 'nashik', label: 'Nashik', pincodes: ['422001', '422002', '422003', '422004', '422005'] },
      { value: 'aurangabad', label: 'Aurangabad', pincodes: ['431001', '431002', '431003', '431004', '431005'] }
    ]
  },
  {
    value: 'manipur',
    label: 'Manipur',
    cities: [
      { value: 'imphal', label: 'Imphal', pincodes: ['795001', '795002', '795003', '795004', '795005'] }
    ]
  },
  {
    value: 'meghalaya',
    label: 'Meghalaya',
    cities: [
      { value: 'shillong', label: 'Shillong', pincodes: ['793001', '793002', '793003', '793004', '793005'] }
    ]
  },
  {
    value: 'mizoram',
    label: 'Mizoram',
    cities: [
      { value: 'aizawl', label: 'Aizawl', pincodes: ['796001', '796002', '796003', '796004', '796005'] }
    ]
  },
  {
    value: 'nagaland',
    label: 'Nagaland',
    cities: [
      { value: 'kohima', label: 'Kohima', pincodes: ['797001', '797002', '797003', '797004', '797005'] }
    ]
  },
  {
    value: 'odisha',
    label: 'Odisha',
    cities: [
      { value: 'bhubaneswar', label: 'Bhubaneswar', pincodes: ['751001', '751002', '751003', '751004', '751005'] },
      { value: 'cuttack', label: 'Cuttack', pincodes: ['753001', '753002', '753003', '753004', '753005'] },
      { value: 'rourkela', label: 'Rourkela', pincodes: ['769001', '769002', '769003', '769004', '769005'] },
      { value: 'berhampur', label: 'Berhampur', pincodes: ['760001', '760002', '760003', '760004', '760005'] }
    ]
  },
  {
    value: 'punjab',
    label: 'Punjab',
    cities: [
      { value: 'chandigarh', label: 'Chandigarh', pincodes: ['160001', '160002', '160003', '160004', '160005'] },
      { value: 'amritsar', label: 'Amritsar', pincodes: ['143001', '143002', '143003', '143004', '143005'] },
      { value: 'ludhiana', label: 'Ludhiana', pincodes: ['141001', '141002', '141003', '141004', '141005'] },
      { value: 'jalandhar', label: 'Jalandhar', pincodes: ['144001', '144002', '144003', '144004', '144005'] }
    ]
  },
  {
    value: 'rajasthan',
    label: 'Rajasthan',
    cities: [
      { value: 'jaipur', label: 'Jaipur', pincodes: ['302001', '302002', '302003', '302004', '302005'] },
      { value: 'jodhpur', label: 'Jodhpur', pincodes: ['342001', '342002', '342003', '342004', '342005'] },
      { value: 'kota', label: 'Kota', pincodes: ['324001', '324002', '324003', '324004', '324005'] },
      { value: 'bikaner', label: 'Bikaner', pincodes: ['334001', '334002', '334003', '334004', '334005'] },
      { value: 'ajmer', label: 'Ajmer', pincodes: ['305001', '305002', '305003', '305004', '305005'] }
    ]
  },
  {
    value: 'sikkim',
    label: 'Sikkim',
    cities: [
      { value: 'gangtok', label: 'Gangtok', pincodes: ['737101', '737102', '737103', '737104', '737105'] }
    ]
  },
  {
    value: 'tamil-nadu',
    label: 'Tamil Nadu',
    cities: [
      { value: 'chennai', label: 'Chennai', pincodes: ['600001', '600002', '600003', '600004', '600005'] },
      { value: 'coimbatore', label: 'Coimbatore', pincodes: ['641001', '641002', '641003', '641004', '641005'] },
      { value: 'madurai', label: 'Madurai', pincodes: ['625001', '625002', '625003', '625004', '625005'] },
      { value: 'salem', label: 'Salem', pincodes: ['636001', '636002', '636003', '636004', '636005'] },
      { value: 'vellore', label: 'Vellore', pincodes: ['632001', '632002', '632003', '632004', '632005'] },
      { value: 'tiruchirappalli', label: 'Tiruchirappalli', pincodes: ['620001', '620002', '620003', '620004', '620005'] }
    ]
  },
  {
    value: 'telangana',
    label: 'Telangana',
    cities: [
      { value: 'hyderabad', label: 'Hyderabad', pincodes: ['500001', '500002', '500003', '500004', '500005'] },
      { value: 'warangal', label: 'Warangal', pincodes: ['506001', '506002', '506003', '506004', '506005'] },
      { value: 'karimnagar', label: 'Karimnagar', pincodes: ['505001', '505002', '505003', '505004', '505005'] },
      { value: 'nizamabad', label: 'Nizamabad', pincodes: ['503001', '503002', '503003', '503004', '503005'] }
    ]
  },
  {
    value: 'tripura',
    label: 'Tripura',
    cities: [
      { value: 'agartala', label: 'Agartala', pincodes: ['799001', '799002', '799003', '799004', '799005'] }
    ]
  },
  {
    value: 'uttar-pradesh',
    label: 'Uttar Pradesh',
    cities: [
      { value: 'lucknow', label: 'Lucknow', pincodes: ['226001', '226002', '226003', '226004', '226005'] },
      { value: 'kanpur', label: 'Kanpur', pincodes: ['208001', '208002', '208003', '208004', '208005'] },
      { value: 'varanasi', label: 'Varanasi', pincodes: ['221001', '221002', '221003', '221004', '221005'] },
      { value: 'allahabad', label: 'Allahabad', pincodes: ['211001', '211002', '211003', '211004', '211005'] },
      { value: 'agra', label: 'Agra', pincodes: ['282001', '282002', '282003', '282004', '282005'] },
      { value: 'ghaziabad', label: 'Ghaziabad', pincodes: ['201001', '201002', '201003', '201004', '201005'] }
    ]
  },
  {
    value: 'uttarakhand',
    label: 'Uttarakhand',
    cities: [
      { value: 'dehradun', label: 'Dehradun', pincodes: ['248001', '248002', '248003', '248004', '248005'] },
      { value: 'haridwar', label: 'Haridwar', pincodes: ['249401', '249402', '249403', '249404', '249405'] },
      { value: 'roorkee', label: 'Roorkee', pincodes: ['247667', '247668', '247669', '247670', '247671'] }
    ]
  },
  {
    value: 'west-bengal',
    label: 'West Bengal',
    cities: [
      { value: 'kolkata', label: 'Kolkata', pincodes: ['700001', '700002', '700003', '700004', '700005'] },
      { value: 'howrah', label: 'Howrah', pincodes: ['711001', '711002', '711003', '711004', '711005'] },
      { value: 'durgapur', label: 'Durgapur', pincodes: ['713201', '713202', '713203', '713204', '713205'] },
      { value: 'asansol', label: 'Asansol', pincodes: ['713301', '713302', '713303', '713304', '713305'] },
      { value: 'siliguri', label: 'Siliguri', pincodes: ['734001', '734002', '734003', '734004', '734005'] }
    ]
  }
];

// Helper functions for cascading dropdowns
export const getCitiesForState = (stateValue: string): DropdownOption[] => {
  const state = indianStates.find(s => s.value === stateValue);
  if (!state) return [];

  return state.cities.map(city => ({
    value: city.value,
    label: city.label
  }));
};

export const getPincodesForCity = (stateValue: string, cityValue: string): DropdownOption[] => {
  const state = indianStates.find(s => s.value === stateValue);
  if (!state) return [];

  const city = state.cities.find(c => c.value === cityValue);
  if (!city) return [];

  return city.pincodes.map(pincode => ({
    value: pincode,
    label: pincode
  }));
};

// Legacy function for backward compatibility
export const getPincodeOptions = (stateValue: string): DropdownOption[] => {
  const state = indianStates.find(s => s.value === stateValue);
  if (!state) return [];

  // Flatten all pincodes from all cities in the state
  const allPincodes = state.cities.flatMap(city => city.pincodes);
  return allPincodes.map(pincode => ({
    value: pincode,
    label: pincode
  }));
};
