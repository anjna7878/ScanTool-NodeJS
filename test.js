const abcd=["a","b","c"]
abcd.forEach((element, key) => {
    console.log(key+" "+element);
    
});
// console.log(a);

// var a;


// console.log(b);

// let b;



// var a = 10;

// function test() {

//     var a = 20;

//     let b = 30;

//     console.log(b)

// }

// test();

// console.log(a);

// console.log(b);

// return false;


let abc = {
    "Name": "JHON",
    "CITY": "MUMBAI",
    "COLLEGE": "VJTI"
}
console.log(Object.keys(abc));
console.log(Object.values(abc));
console.log(Object.entries(abc));
console.log(Object.keys(abc).length);

// let a = ["A", "B", "C"];
// let b = ["D", "E"];
return false;
// let c = a.concat(b);
// console.log(c);
// console.log(Object.keys(c).length);

// Object.entries(abc).forEach(([key, value]) => {
//     console.log(`${key}: ${value}`)
// });

// var arrr = [{
//     id: 1,
//     name: 'bill'
// }, {
//     id: 2,
//     name: 'ted'
// }]

// var result = arrr.map((person,index,array) => ({ key:index, value: person.id, text: person.name}));
// console.log(result)

// return false;




let tele = ["JIO", "RIL", "FIB", "HIC","HID"]
setTimeout(() => {
    console.log('timeout');
    console.log(tele);
}, 1000);

// setInterval(() => {
//     console.log('interval');
//     console.log(tele);
// }, 10000);

let arr = [];
let map = tele.map((item, index) => {
    console.log(index + " == " + item)
    let i = item.indexOf("I")
    console.log('i',i);
    return arr.push({ key: item.substr(0, i), position: item.substr(i + 1) })
})
console.log('arr',arr);
console.log('map',map);

return false;
// arr.forEach((item, index) => {
//     console.log(index+" == "+item.key+" I "+item.position)
// });

let as = arr.map((item, index) => {
    return item.key+"I"+item.position;
})
console.log('as',as)

// console.log(tele.includes("GOOGLE"));