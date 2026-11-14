// Date-only values are calendar dates, never UTC instants. Formats affect display only.
export const DEFAULT_DATE_FORMAT='dd/MM/yyyy';
export const DEFAULT_DATETIME_FORMAT='dd/MM/yyyy HH:mm:ss';
export function resolveDateFormat(field={},settings={}){
 return field.format || (field.type==='datetime'?settings.dateTimeFormat||DEFAULT_DATETIME_FORMAT:settings.dateFormat||DEFAULT_DATE_FORMAT);
}
function partsOfIso(value){
 const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value||''));
 if(!m)throw Error('INVALID_ISO_DATE');
 const [,y,mo,d]=m;const dt=new Date(Date.UTC(Number(y),Number(mo)-1,Number(d)));
 if(dt.getUTCFullYear()!==Number(y)||dt.getUTCMonth()!==Number(mo)-1||dt.getUTCDate()!==Number(d))throw Error('INVALID_DATE');
 return {yyyy:y,MM:mo,dd:d};
}
export function formatDate(value,format=DEFAULT_DATE_FORMAT){
 const p=partsOfIso(value);
 if(!['dd/MM/yyyy','yyyy-MM-dd','MM/dd/yyyy','dd-MM-yyyy'].includes(format))throw Error('UNSUPPORTED_DATE_FORMAT');
 return format.replace(/yyyy|MM|dd/g,k=>p[k]);
}
export function parseDate(value,format=DEFAULT_DATE_FORMAT){
 const supported={'dd/MM/yyyy':/^(\d{2})\/(\d{2})\/(\d{4})$/,'yyyy-MM-dd':/^(\d{4})-(\d{2})-(\d{2})$/,'MM/dd/yyyy':/^(\d{2})\/(\d{2})\/(\d{4})$/,'dd-MM-yyyy':/^(\d{2})-(\d{2})-(\d{4})$/};
 const pattern=supported[format];if(!pattern)throw Error('UNSUPPORTED_DATE_FORMAT');
 const m=pattern.exec(String(value||''));if(!m)throw Error('INVALID_DATE_FORMAT');
 const tokens=format.match(/yyyy|MM|dd/g);const obj=Object.fromEntries(tokens.map((k,i)=>[k,m[i+1]]));
 const iso=`${obj.yyyy}-${obj.MM}-${obj.dd}`;partsOfIso(iso);return iso;
}
