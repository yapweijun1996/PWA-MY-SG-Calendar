// ISO 3166 subdivision codes, checked against LHDN's published state-code list.
export const regions = [
  {id:'SG',country:'SG',name:'Singapore'},
  ...['Johor','Kedah','Kelantan','Melaka','Negeri Sembilan','Pahang','Pulau Pinang','Perak','Perlis','Selangor','Terengganu','Sabah','Sarawak','Kuala Lumpur','Labuan','Putrajaya']
    .map((name,index)=>({id:`MY-${String(index+1).padStart(2,'0')}`,country:'MY',name})),
] as const;
export function isRegion(value:unknown):value is string {return typeof value==='string'&&regions.some(region=>region.id===value);}
