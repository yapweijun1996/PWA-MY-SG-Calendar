import type {Locale} from '../data/repository';

const names={
  'negeri-sembilan-ruler-birthday':['Birthday of the Yang di-Pertuan Besar of Negeri Sembilan','森美兰最高统治者诞辰','Hari Keputeraan Yang di-Pertuan Besar Negeri Sembilan','நெகிரி செம்பிலான் ஆட்சியாளர் பிறந்தநாள்'],
  'israk-mikraj':['Israk and Mikraj','登霄节','Israk dan Mikraj','இஸ்ரா மிஃராஜ்'],
  'federal-territory-day':['Federal Territory Day','联邦直辖区日','Hari Wilayah Persekutuan','கூட்டரசுப் பிரதேச தினம்'],
  thaipusam:['Thaipusam','大宝森节','Thaipusam','தைப்பூசம்'],
  'awal-ramadan':['Beginning of Ramadan','斋戒月首日','Awal Ramadan','ரமலான் தொடக்கம்'],
  'melaka-independence-declaration':['Melaka Independence Declaration Day','马六甲独立宣言纪念日','Hari Perisytiharan Tarikh Kemerdekaan','மலாக்கா சுதந்திர அறிவிப்பு தினம்'],
  'terengganu-installation':['Installation Anniversary of the Sultan of Terengganu','登嘉楼苏丹登基纪念日','Hari Ulang Tahun Pertabalan Sultan Terengganu','திரெங்கானு சுல்தான் முடிசூட்டு ஆண்டு தினம்'],
  'nuzul-quran':['Nuzul Al-Quran','可兰经降世日','Nuzul Al-Quran','நுஸுல் அல் குர்ஆன்'],
  'johor-sultan-birthday':['Birthday of the Sultan of Johor','柔佛苏丹诞辰','Hari Keputeraan Sultan Johor','ஜொகூர் சுல்தான் பிறந்தநாள்'],
  'sabah-governor-birthday':['Birthday of the Governor of Sabah','沙巴州元首诞辰','Hari Jadi Yang di-Pertua Negeri Sabah','சபா ஆளுநர் பிறந்தநாள்'],
  'terengganu-sultan-birthday':['Birthday of the Sultan of Terengganu','登嘉楼苏丹诞辰','Hari Keputeraan Sultan Terengganu','திரெங்கானு சுல்தான் பிறந்தநாள்'],
  'perlis-raja-birthday':['Birthday of the Raja of Perlis','玻璃市拉惹诞辰','Hari Keputeraan Raja Perlis','பெர்லிஸ் ராஜா பிறந்தநாள்'],
  'pahang-hol':['Hari Hol of Sultan Ahmad Shah','彭亨苏丹阿末沙忌辰','Hari Hol Almarhum Sultan Ahmad Shah','சுல்தான் அஹ்மத் ஷா நினைவு தினம்'],
  arafah:['Day of Arafah','阿拉法日','Hari Arafah','அரஃபா நாள்'],
  kaamatan:['Kaamatan Harvest Festival','丰收节','Pesta Kaamatan','காமாத்தான் அறுவடை விழா'],
  'agong-birthday':['Birthday of the Yang di-Pertuan Agong','国家元首诞辰','Hari Keputeraan Yang di-Pertuan Agong','மலேசிய மாமன்னர் பிறந்தநாள்'],
  gawai:['Gawai Dayak','达雅节','Hari Gawai Dayak','காவாய் டாயாக் விழா'],
  'awal-muharram':['Awal Muharram','回历元旦','Awal Muharam','முஹர்ரம் புத்தாண்டு'],
  'kedah-sultan-birthday':['Birthday of the Sultan of Kedah','吉打苏丹诞辰','Hari Keputeraan Sultan Kedah','கெடா சுல்தான் பிறந்தநாள்'],
  'george-town-heritage':['George Town World Heritage City Day','乔治市世界遗产日','Hari Bandar Warisan Dunia George Town','ஜார்ஜ் டவுன் உலகப் பாரம்பரிய நகர தினம்'],
  'penang-governor-birthday':['Birthday of the Governor of Penang','槟城州元首诞辰','Hari Jadi Yang di-Pertua Negeri Pulau Pinang','பினாங்கு ஆளுநர் பிறந்தநாள்'],
  'johor-hol':['Hari Hol of Sultan Iskandar','柔佛苏丹依斯干达忌辰','Hari Hol Almarhum Sultan Iskandar','சுல்தான் இஸ்கந்தர் நினைவு தினம்'],
  'sarawak-day':['Sarawak Day','砂拉越日','Hari Sarawak','சரவாக் தினம்'],
  'pahang-sultan-birthday':['Birthday of the Sultan of Pahang','彭亨苏丹诞辰','Hari Keputeraan Sultan Pahang','பகாங் சுல்தான் பிறந்தநாள்'],
  'melaka-governor-birthday':['Birthday of the Governor of Melaka','马六甲州元首诞辰','Hari Jadi Yang di-Pertua Negeri Melaka','மலாக்கா ஆளுநர் பிறந்தநாள்'],
  'maulidur-rasul':['Prophet Muhammad’s Birthday','先知穆罕默德诞辰','Maulidur Rasul','நபிகள் நாயகம் பிறந்தநாள்'],
  'my-national-day':['Malaysia National Day','马来西亚国庆日','Hari Kebangsaan Malaysia','மலேசிய தேசிய தினம்'],
  'malaysia-day':['Malaysia Day','马来西亚日','Hari Malaysia','மலேசிய தினம்'],
  'kelantan-sultan-birthday':['Birthday of the Sultan of Kelantan','吉兰丹苏丹诞辰','Hari Keputeraan Sultan Kelantan','கிளந்தான் சுல்தான் பிறந்தநாள்'],
  'sarawak-governor-birthday':['Birthday of the Governor of Sarawak','砂拉越州元首诞辰','Hari Jadi Yang di-Pertua Negeri Sarawak','சரவாக் ஆளுநர் பிறந்தநாள்'],
  'perak-sultan-birthday':['Birthday of the Sultan of Perak','霹雳苏丹诞辰','Hari Keputeraan Sultan Perak','பேராக் சுல்தான் பிறந்தநாள்'],
  'selangor-sultan-birthday':['Birthday of the Sultan of Selangor','雪兰莪苏丹诞辰','Hari Keputeraan Sultan Selangor','சிலாங்கூர் சுல்தான் பிறந்தநாள்'],
  'christmas-eve':['Christmas Eve','平安夜','Malam Krismas','கிறிஸ்துமஸ் முந்தைய நாள்'],
  'additional-eid':['Additional Aidilfitri holiday','开斋节额外假期','Cuti tambahan Aidilfitri','நோன்புப் பெருநாள் கூடுதல் விடுமுறை'],
  'selangor-silver-jubilee':['Silver Jubilee of the Sultan of Selangor','雪兰莪苏丹登基银禧纪念日','Jubli Perak Pemerintahan Sultan Selangor','சிலாங்கூர் சுல்தான் ஆட்சியின் வெள்ளி விழா'],
  'dragon-boat':['Dragon Boat Festival','端午节','Perayaan Perahu Naga','டிராகன் படகு விழா'],
  'mid-autumn':['Mid-Autumn Festival','中秋节','Perayaan Pertengahan Musim Luruh','நடு இலையுதிர் விழா'],
  'new-year':['New Year’s Day','元旦','Tahun Baharu','புத்தாண்டு தினம்'],
  'chinese-new-year':['Chinese New Year','农历新年','Tahun Baharu Cina','சீனப் புத்தாண்டு'],
  'hari-raya-puasa':['Hari Raya Puasa','开斋节','Hari Raya Puasa','ஹரி ராயா பூசா'],
  'good-friday':['Good Friday','耶稣受难日','Good Friday','புனித வெள்ளி'],
  'labour-day':['Labour Day','劳动节','Hari Pekerja','தொழிலாளர் தினம்'],
  'hari-raya-haji':['Hari Raya Haji','哈芝节','Hari Raya Haji','ஹரி ராயா ஹாஜி'],
  vesak:['Vesak Day','卫塞节','Hari Wesak','விசாக தினம்'],
  'sg-national-day':['National Day','新加坡国庆日','Hari Kebangsaan Singapura','சிங்கப்பூர் தேசிய தினம்'],
  deepavali:['Deepavali','屠妖节','Deepavali','தீபாவளி'],
  christmas:['Christmas Day','圣诞节','Hari Krismas','கிறிஸ்துமஸ் தினம்'],
} satisfies Record<string,[string,string,string,string]>;
export function eventName(key:string,locale:Locale):string {
  const day=key.match(/-day-([23])$/)?.[1];
  const base=day?key.replace(/-day-[23]$/,''):key;
  const value=names[base as keyof typeof names];
  if(!value)return key;
  const index={en:0,'zh-Hans':1,ms:2,ta:3} as const;
  const label=value[index[locale]];
  const suffix={en:`day ${day}`,'zh-Hans':`第${day}天`,ms:`hari ke-${day}`,ta:`நாள் ${day}`};
  return day?`${label} (${suffix[locale]})`:label;
}
