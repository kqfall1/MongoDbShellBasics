I have created a simple script that assembles a student object using RNG abstractions, pushes the students to an array, 
and populates the localhost MongoDB server with the generated students. In doing so, I have bolstered my skills in both 
using JavaScript and using the MongoDB shell. 

I have also stress-tested my script to some degree, but have noticed that 
the performance of the script goes down exponentially as the document creation count increases linearly (200,000 
documents can be generated and added in ~20 seconds, but 2,000,000 documents takes several minutes). I should begin 
reading into algorithms and how they work, for I am ready to move forward as a software engineer. I improved the initial
version of my script by having "populate()" insert batches of students repeatedly rather than doing it one at a time or 
all at once. I also improved performance by using the counter of the loop in "populate()" to determine the next available 
"StudentId" field rather than calling "db[COLLECTION_NAME].countDocuments() + 1". 

I look forward to writing more cool scripts like this in the future. It turns out that JavaScript isn't that bad of a language
for engineers who a) know what they're doing, b) exercise strong architectural discipline. I am no JS expert, but I think I 
demonstrated proficiency in both of those items on this assessment. 

- Quinn Keenan
- 29/11/2025, 10:38AM 