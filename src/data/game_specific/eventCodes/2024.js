// An array of event codes with names and week #s. The weeks are indexed to 0, so add 1 if you need to display them for any reason
const Events = [
    { code: "2024alhu", name: "Rocket City Regional", week: 5 },
    { code: "2024arli", name: "Arkansas Regional", week: 1 },
    { code: "2024ausc", name: "Southern Cross Regional", week: 2 },
    { code: "2024azgl", name: "Arizona East Regional", week: 3 }, 
    { code: "2024azva", name: "Arizona Valley Regional", week: 2 }, 
    { code: "2024bcvi", name: "Canadian Pacific Regional", week: 0 }, 
    { code: "2024brbr", name: "Brazil Regional", week: 0 }, 
    { code: "2024caav", name: "Aerospace Valley Regional", week: 5 }, 
    { code: "2024cabe", name: "East Bay Regional", week: 5 }, 
    { code: "2024cada", name: "Sacramento Regional", week: 2 }, 
    { code: "2024cafr", name: "Central Valley Regional", week: 3 }, 
    { code: "2024cala", name: "Los Angeles Regional", week: 2 }, 
    { code: "2024camb", name: "Monterey Bay Regional", week: 4 }, 
    { code: "2024caoc", name: "Orange County Regional", week: 4 }, 
    { code: "2024caph", name: "Hueneme Port Regional", week: 0 }, 
    { code: "2024casd", name: "San Diego Regional presented by Qualcomm", week: 3 }, 
    { code: "2024casf", name: "San Francisco Regional", week: 1 }, 
    { code: "2024casj", name: "Silicon Valley Regional", week: 0 }, 
    { code: "2024cave", name: "Ventura County Regional", week: 1 },
    { code: "2024chcmp", name: "FIRST Chesapeake District Championship", week: 5 }, 
    { code: "2024cmptx", name: "FIRST Championship", week: null }, 
    { code: "2024cocs", name: "Colorado Scrimmage", week: null }, 
    { code: "2024code", name: "Colorado Regional", week: 3 }, 
    { code: "2024cthar", name: "NE District Hartford Event", week: 0 }, 
    { code: "2024ctwat", name: "NE District Waterbury Event", week: 1 }, 
    { code: "2024flor", name: "Orlando Regional", week: 3 }, 
    { code: "2024flta", name: "Tallahassee Regional", week: 2 }, 
    { code: "2024flwp", name: "South Florida Regional", week: 0 }, 
    { code: "2024gaalb", name: "PCH District Albany Event", week: 4 }, 
    { code: "2024gacar", name: "PCH District Carrollton Event", week: 3 }, 
    { code: "2024gacmp", name: "Peachtree District Championship", week: 5 }, 
    { code: "2024gadal", name: "PCH District Dalton Event", week: 1 }, 
    { code: "2024gagwi", name: "PCH District Gwinnett Event", week: 2 }, 
    { code: "2024hiho", name: "Hawaii Regional", week: 5 }, 
    { code: "2024iacf", name: "Iowa Regional", week: 3 }, 
    { code: "2024idbo", name: "Idaho Regional", week: 3 }, 
    { code: "2024ilch", name: "Midwest Regional", week: 4 }, 
    { code: "2024ilpe", name: "Central Illinois Regional", week: 2 }, 
    { code: "2024incmp", name: "FIRST Indiana State Championship", week: 5 }, 
    { code: "2024incol", name: "FIN District Columbus Event", week: 2 }, 
    { code: "2024ineva", name: "FIN District Washington Event presented by Toyota", week: 4 }, 
    { code: "2024inmis", name: "FIN District Mishawaka Event", week: 0 }, 
    { code: "2024inpla", name: "FIN District Plainfield Event presented by Carrier", week: 3 }, 
    { code: "2024iscmp", name: "FIRST Israel District Championship", week: 3 }, 
    { code: "2024isde1", name: "ISR District Event #1", week: 0 }, 
    { code: "2024isde2", name: "ISR District Event #2", week: 0 }, 
    { code: "2024isde3", name: "ISR District Event #3", week: 1 }, 
    { code: "2024isde4", name: "ISR District Event #4", week: 2 }, 
    { code: "2024ksla", name: "Heartland Regional", week: 2 }, 
    { code: "2024lake", name: "Bayou Regional", week: 5 }, 
    { code: "2024mabos", name: "NE District Greater Boston Event", week: 3 }, 
    { code: "2024mabri", name: "NE District BSU Event", week: 1 }, 
    { code: "2024marea", name: "NE District North Shore Event", week: 2 }, 
    { code: "2024mawne", name: "NE District Western NE Event", week: 3 }, 
    { code: "2024mawor", name: "NE District WPI Event", week: 4 }, 
    { code: "2024mawsp", name: "NE District BigE Event", week: 0 }, 
    { code: "2024mdowi", name: "CHS District Owings Mills MD Event", week: 3 }, 
    { code: "2024mdsev", name: "CHS District Severn MD Event", week: 2 }, 
    { code: "2024melew", name: "NE District Pine Tree Event", week: 2 }, 
    { code: "2024miann", name: "FIM District Ann Arbor Event", week: 2 }, 
    { code: "2024mibat", name: "FIM District Battle Creek Event", week: 0 }, 
    { code: "2024mibel", name: "FIM District Belleville Event", week: 1 }, 
    { code: "2024miber", name: "FIM District Berrien Springs Event", week: 0 }, 
    { code: "2024mibkn", name: "FIM District Jackson at Columbia Event", week: 0 }, 
    { code: "2024mibro", name: "FIM District Woodhaven Event", week: 1 }, 
    { code: "2024micmp", name: "FIRST in Michigan State Championship", week: 5 }, 
    { code: "2024midet", name: "FIM District Renaissance Event", week: 4 }, 
    { code: "2024midtr", name: "FIM District Wayne State Event", week: 2 }, 
    { code: "2024miesc", name: "FIM District Escanaba Event", week: 1 }, 
    { code: "2024mike2", name: "FIM District Kettering University Event #2", week: 1 }, 
    { code: "2024miken", name: "FIM District Kentwood Event", week: 4 }, 
    { code: "2024miket", name: "FIM District Kettering University Event #1", week: 0 }, 
    { code: "2024milac", name: "FIM District Lake City Event", week: 1 }, 
    { code: "2024milan", name: "FIM District Lansing Event", week: 3 }, 
    { code: "2024miliv", name: "FIM District Livonia Event", week: 3 }, 
    { code: "2024milsu", name: "FIM District LSSU Event", week: 2 }, 
    { code: "2024mimcc", name: "FIM District Macomb District Event", week: 4 }, 
    { code: "2024mimid", name: "FIM District Midland Event", week: 3 }, 
    { code: "2024mimil", name: "FIM District Milford Event", week: 0 }, 
    { code: "2024mimtp", name: "FIM District Central Michigan University Event", week: 4 }, 
    { code: "2024mimus", name: "FIM District Muskegon Event", week: 2 }, 
    { code: "2024misjo", name: "FIM District St. Joseph Event", week: 1 }, 
    { code: "2024mitr2", name: "FIM District Troy Event #2", week: 4 }, 
    { code: "2024mitry", name: "FIM District Troy Event #1", week: 3 }, 
    { code: "2024mitvc", name: "FIM District Traverse City Event", week: 2 }, 
    { code: "2024miwmi", name: "FIM District West Michigan Event", week: 3 }, 
    { code: "2024mnbt", name: "Blue Twilight Week Zero Invitational", week: null }, 
    { code: "2024mndu", name: "Lake Superior Regional", week: 0 }, 
    { code: "2024mndu2", name: "Northern Lights Regional", week: 0 }, 
    { code: "2024mnmi", name: "Minnesota 10,000 Lakes Regional", week: 5 }, 
    { code: "2024mnmi2", name: "Minnesota Granite City Regional", week: 5 }, 
    { code: "2024mokc", name: "Greater Kansas City Regional", week: 5 }, 
    { code: "2024mose", name: "Central Missouri Regional", week: 1 }, 
    { code: "2024mosl", name: "St. Louis Regional", week: 3 }, 
    { code: "2024mrcmp", name: "FIRST Mid-Atlantic District Championship", week: 5 }, 
    { code: "2024mslr", name: "Magnolia Regional", week: 2 }, 
    { code: "2024mxmo", name: "Regional Monterrey", week: 0 }, 
    { code: "2024mxpu", name: "Regional Hermosillo", week: 2 }, 
    { code: "2024mxto", name: "Regional Laguna presented by Peñoles", week: 3 }, 
    { code: "2024ncash", name: "FNC District UNC Asheville Event", week: 2 }, 
    { code: "2024nccmp", name: "FIRST North Carolina District State Championship", week: 5 }, 
    { code: "2024ncmec", name: "FNC District Mecklenburg County Event", week: 3 }, 
    { code: "2024ncpem", name: "FNC District UNC Pembroke Event", week: 1 }, 
    { code: "2024ncwa2", name: "FNC District Wake County Event", week: 3 }, 
    { code: "2024ncwak", name: "FNC District Orange County Event", week: 0 }, 
    { code: "2024ndgf", name: "Great Northern Regional", week: 1 }, 
    { code: "2024necmp", name: "New England FIRST District Championship", week: 5 }, 
    { code: "2024nhdur", name: "NE District UNH Event", week: 4 }, 
    { code: "2024nhgrs", name: "NE District Granite State Event", week: 0 }, 
    { code: "2024njall", name: "FMA District Allentown Event", week: 1 }, 
    { code: "2024njfla", name: "FMA District Mount Olive Event", week: 0 }, 
    { code: "2024njski", name: "FMA District Montgomery Event", week: 2 }, 
    { code: "2024njtab", name: "FMA District Seneca Event", week: 1 }, 
    { code: "2024njwas", name: "FMA District Warren Hills Event", week: 3 }, 
    { code: "2024nvlv", name: "Las Vegas Regional", week: 4 }, 
    { code: "2024nyli2", name: "FIRST Long Island Regional", week: 3 }, 
    { code: "2024nyny", name: "New York City Regional", week: 5 }, 
    { code: "2024nyro", name: "Finger Lakes Regional", week: 2 }, 
    { code: "2024nysu", name: "Hudson Valley Regional", week: 1 }, 
    { code: "2024nytr", name: "New York Tech Valley Regional", week: 3 }, 
    { code: "2024nywz", name: "Regal Eagle Rampage", week: null }, 
    { code: "2024ohcl", name: "Buckeye Regional", week: 3 }, 
    { code: "2024ohmv", name: "Miami Valley Regional", week: 5 }, 
    { code: "2024okok", name: "Oklahoma Regional", week: 5 }, 
    { code: "2024oktu", name: "Green Country Regional", week: 1 }, 
    { code: "2024onbar", name: "ONT District Georgian Event", week: 2 }, 
    { code: "2024oncmp", name: "FIRST Ontario Provincial Championship", week: 5 }, 
    { code: "2024onham", name: "ONT District McMaster University", week: 4 }, 
    { code: "2024onnew", name: "ONT District Newmarket Complex Event", week: 1 }, 
    { code: "2024onnob", name: "ONT District North Bay Event", week: 3 }, 
    { code: "2024onosh", name: "ONT District Durham College Event", week: 2 }, 
    { code: "2024onsca", name: "ONT District Centennial College Event", week: 1 }, 
    { code: "2024ontor", name: "ONT District Humber College Event", week: 3 }, 
    { code: "2024onwat", name: "ONT District University of Waterloo Event", week: 3 }, 
    { code: "2024onwin", name: "ONT District Windsor Essex Great Lakes Event", week: 4 }, 
    { code: "2024orore", name: "PNW District Clackamas Academy Event", week: 0 }, 
    { code: "2024orsal", name: "PNW District Oregon State Fairgrounds Event", week: 1 }, 
    { code: "2024orwil", name: "PNW District Wilsonville Event", week: 3 }, 
    { code: "2024paben", name: "FMA District Bensalem Event", week: 3 }, 
    { code: "2024paca", name: "Greater Pittsburgh Regional", week: 0 }, 
    { code: "2024pahat", name: "FMA District Hatboro-Horsham Event", week: 0 }, 
    { code: "2024paphi", name: "FMA District Springside Chestnut Hill Event", week: 2 }, 
    { code: "2024pncmp", name: "Pacific Northwest FIRST District Championship", week: 5 }, 
    { code: "2024qcmo", name: "Festival de Robotique Regional", week: 0 }, 
    { code: "2024rikin", name: "NE District URI Event", week: 2 }, 
    { code: "2024scand", name: "PCH District Anderson Event presented by MAGNA", week: 1 }, 
    { code: "2024sccha", name: "PCH District Charleston Event", week: 3 }, 
    { code: "2024tnkn", name: "Smoky Mountains Regional", week: 0 }, 
    { code: "2024tuhc", name: "Haliç Regional", week: 3 }, 
    { code: "2024tuis", name: "İstanbul Regional", week: 1 }, 
    { code: "2024tuis2", name: "Bosphorus Regional", week: 1 }, 
    { code: "2024tuis3", name: "Marmara Regional", week: 3 }, 
    { code: "2024txama", name: "FIT District Amarillo Event", week: 4 }, 
    { code: "2024txbel", name: "FIT District Belton Event", week: 1 }, 
    { code: "2024txcle", name: "FIT District Space City @ Friendswood Event", week: 4 }, 
    { code: "2024txcmp", name: "FIRST In Texas District Championship", week: 5 }, 
    { code: "2024txdal", name: "FIT District Dallas Event", week: 3 }, 
    { code: "2024txfor", name: "FIT District Fort Worth Event", week: 2 }, 
    { code: "2024txhou", name: "FIT District Houston Event", week: 3 }, 
    { code: "2024txkat", name: "FIT District Katy Event", week: 0 }, 
    { code: "2024txpla", name: "FIT District Plano Event", week: 1 }, 
    { code: "2024txsan", name: "FIT District San Antonio Event", week: 2 }, 
    { code: "2024txwac", name: "FIT District Waco Event", week: 0 }, 
    { code: "2024utwv", name: "Utah Regional", week: 0 }, 
    { code: "2024vaash", name: "CHS District Ashland VA Event", week: 0 }, 
    { code: "2024vabla", name: "CHS District Blacksburg VA Event", week: 0 }, 
    { code: "2024vafal", name: "CHS District Falls Church VA Event presented by Department of Energy", week: 3 }, 
    { code: "2024vagle", name: "CHS District Glen Allen VA Event", week: 2 }, 
    { code: "2024vapor", name: "CHS District Portsmouth VA Event", week: 1 }, 
    { code: "2024waahs", name: "PNW District Auburn Event", week: 1 }, 
    { code: "2024wabon", name: "PNW District Bonney Lake Event", week: 2 }, 
    { code: "2024wasam", name: "PNW District Sammamish Event", week: 3 }, 
    { code: "2024wasno", name: "PNW District Glacier Peak Event", week: 0 }, 
    { code: "2024wayak", name: "PNW District SunDome Event", week: 2 }, 
    { code: "2024wila", name: "Seven Rivers Regional", week: 5 }, 
    { code: "2024wimi", name: "Wisconsin Regional", week: 2 }, 
    { code: "2024zhha", name: "China Regional", week: 3 }
];

export default Events;