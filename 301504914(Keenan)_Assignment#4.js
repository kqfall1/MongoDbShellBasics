//Quinn Keenan, 301504914, 2025/28/11

const ADDR_CITY_LBL = "City";
const ADDR_POSTAL_CODE_LBL = "PostalCode";
const ADDR_STREET_LBL = "StreetName";
const ADDR_STREET_NO_LBL = "StreetNo"; 
const ADDR_UNIT_LBL = "Unit"; 
const BULK_QUERY_LIMIT = 10; 
const COLLECTION_NAME = "COMP214_Students"; 
const DB_NAME = "College_Students";
const DB_FULL_NAME = `"${DB_NAME}.${COLLECTION_NAME}"`;
const DOCUMENT_CREATION_COUNT = 200000; 
const GPA_THRESHOLD = 3.0; 
const STU_ADDRESS_LBL = "Address";
const STU_EMAIL_LBL = "EmailAddress"; 
const STU_FNAME_LBL = "Fname"; 
const STU_GPA_LBL = "GPA";
const STU_ID_LBL = "StudentId"; 
const STU_LNAME_LBL = "Lname"; 
const STU_PHONE_LBL = "PhoneNumber";

function assignmentQueries() {
	print(`\nThe first ${BULK_QUERY_LIMIT} documents in ${DB_FULL_NAME}:`);
	db[COLLECTION_NAME].aggregate([{$limit: 10}]).toArray().forEach(doc => printjson(doc));

	print(`\nThe "${STU_FNAME_LBL}", "${STU_LNAME_LBL}", "${STU_EMAIL_LBL}" fields for the first ${BULK_QUERY_LIMIT} documents in ${DB_FULL_NAME}:`);
	db[COLLECTION_NAME].aggregate([
		{$project: { [STU_FNAME_LBL]: 1, [STU_LNAME_LBL]: 1, [STU_EMAIL_LBL]: 1}}, 
		{$limit: BULK_QUERY_LIMIT}
	]).toArray().forEach(doc => printjson(doc));
	
	print(`\nThere are ${db[COLLECTION_NAME].countDocuments()} total documents in ${DB_FULL_NAME}.`);
	
	const CITY_FIELD = `${STU_ADDRESS_LBL}.${ADDR_CITY_LBL}`;
	print(`There are ${db[COLLECTION_NAME].distinct(CITY_FIELD).length} distinct cities present in ${DB_FULL_NAME}.`);
	
	const gpaDoc = db[COLLECTION_NAME].aggregate([{
		$group: {
			_id: null, 
			avg: {$avg: `$${STU_GPA_LBL}`}, 
			max: {$max: `$${STU_GPA_LBL}`}, 
			min: {$min: `$${STU_GPA_LBL}`}
		}
	}]).toArray();
	print(`The average GPA of students in ${DB_FULL_NAME} is ${gpaDoc[0].avg.toFixed(2)}. The highest GPA is ${gpaDoc[0].max} and the lowest GPA is ${gpaDoc[0].min}.`);
	
	const gpaMatches = db[COLLECTION_NAME].find(
		{[STU_GPA_LBL]: GPA_THRESHOLD}, 
	).toArray();
	
	const aboveThresholdGpas = db[COLLECTION_NAME].find(
		{[STU_GPA_LBL]: {$gt: GPA_THRESHOLD}}
	).toArray();
	
	print(`There are ${gpaMatches.length} students in ${DB_FULL_NAME} with a GPA of ${GPA_THRESHOLD}. ${aboveThresholdGpas.length} students are above that threshold and ${DOCUMENT_CREATION_COUNT - aboveThresholdGpas.length} students are below.`);
	
	print(`\nThe top 3 students by GPA are as follows:`);
	
	const topStudents = db[COLLECTION_NAME].aggregate([
		{$sort: { [STU_GPA_LBL]: -1, [STU_LNAME_LBL]: -1, [STU_FNAME_LBL]: -1 }},
		{$limit: 3}, 
		{$project: { [STU_FNAME_LBL]: true, [STU_LNAME_LBL]: true, [STU_GPA_LBL]: true, [STU_ID_LBL]: true}}
	]).toArray();
	
	topStudents.forEach((student) => {
		print(`\t${student[STU_ID_LBL]}, ${student[STU_FNAME_LBL]} ${student[STU_LNAME_LBL]}. GPA: ${student[STU_GPA_LBL]}.`);
	});
}

function init() {
	print(`Initializing ${DB_FULL_NAME}`);
	db = db.getSiblingDB(DB_NAME);
	db.dropDatabase();
	db.createCollection(COLLECTION_NAME);
	print(`Initialized ${DB_FULL_NAME}`);
}

function main() {
	const start = Date.now(); 
	
	init(); 
	populate(); 
	assignmentQueries(); 
	
	const end = Date.now(); 
	const timeElapsed = (end - start) / 1000; 
	print(`\nScript completed in ${timeElapsed.toFixed(2)} seconds.`);
}

function populate() {
	const BATCH_SIZE = 5000; 
	let students = []; 

	print(`\nPopulating ${DB_FULL_NAME}`)
	
	for (let count = 0; count < DOCUMENT_CREATION_COUNT; count++) {
		students.push(randomStudent(count + 1)); 

		if (students.length >= BATCH_SIZE) {
			db[COLLECTION_NAME].insertMany(students);
			students = []; 
		}
	}

	if (students.length > 0) {
		db[COLLECTION_NAME].insertMany(students);
	}

	print(`Populated ${DB_FULL_NAME}`)
}

function randomAddress() {
	const CITIES = ["Toronto", "Vancouver", "Calgary", "Montreal", "Saskatchewan", "New York City", "Los Angeles", "Denver", "Seattle"];
	const MAX_STREET_NO = 5000; 
	const MAX_UNIT_NO = 30; 
	const STREET_NAMES = ["Oak Street", "Dirt Road", "Birchmount Road", "Eglinton Avenue East", "Progress Avenue", "Markham Avenue"];
  
	return {
		[ADDR_STREET_LBL]: STREET_NAMES[Math.floor(Math.random() * STREET_NAMES.length)], 
		[ADDR_STREET_NO_LBL]: Math.floor(Math.random() * MAX_STREET_NO), 
		[ADDR_UNIT_LBL]: Math.random() < 0.5 
			? Math.floor(Math.random() * MAX_UNIT_NO) 
			: null,
		[ADDR_CITY_LBL]: CITIES[Math.floor(Math.random() * CITIES.length)], 
		[ADDR_POSTAL_CODE_LBL]: randomPostalCode()
	};
}

function randomDigit() {
	return Math.floor(Math.random() * 10);
}

function randomEmail(nameObj) {
	return `${nameObj.fName.toLowerCase()}${nameObj.lName.toLowerCase()}@gmail.com`; 
}

function randomGpa() {
	const GPA_SCALE = 4.5; 
	return parseFloat((Math.random() * GPA_SCALE).toFixed(2)); 
}

function randomName() {
	const FIRST_NAMES = ["Alex", "Billy", "Charlie", "David", "Elsa", "Frank", "Giselle", "Henry", "Ian", "Jack", "Kevin", "Larry", "Margaret", "Newman"];
	const LAST_NAMES = ["Aaron", "Benson", "Clapton", "Dobe", "Enright", "Ferguson", "Gale", "Hutchinson", "Owens", "Jensen", "Jones", "Green", "White", "Brown"];

	return {
		fName: FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)], 
		lName: LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]
	}; 
}

function randomPhoneNumber() {
	let phoneNumber = ''; 
	const PHONE_NUMBER_DIGIT_COUNT = 11; //including the area code. 
  
	for (let count = 0; count < PHONE_NUMBER_DIGIT_COUNT; count++) {
		phoneNumber = `${phoneNumber}${randomDigit()}`;
	}
  
	return phoneNumber; 
}

function randomPostalCode() {
	const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
	let code = ''; 
	const POSTAL_CODE_ELEMENT_COUNT = 3; 
  
	for (let count = 0; count < POSTAL_CODE_ELEMENT_COUNT; count++) {
		const digit = randomDigit(); 
		const letter = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
		code = `${code}${letter}${digit}`;
	}
  
	return code;
}

function randomStudent(studentId) {
	const name = randomName(); 
  
	return {
		[STU_ID_LBL]: studentId, 
		[STU_FNAME_LBL]: name.fName, 
		[STU_LNAME_LBL]: name.lName, 
		[STU_ADDRESS_LBL]: randomAddress(), 
		[STU_EMAIL_LBL]: randomEmail(name), 
		[STU_PHONE_LBL]: randomPhoneNumber(), 
		[STU_GPA_LBL]: randomGpa()
	}; 
}

main();
