

// //try-catch asynchandler  //async handler is a higher order function it can take function as parameter
// const asynchandler=(fn)=async(req,res,next)=>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.staus(err.code||500).json({
//             success:false,
//             message:err.message
//         })
//     }

// }



//using promise
const asynchandler = (requesthandler) => {
   return (req, res, next) => {
     // Ensure that async functions are handled correctly
     Promise.resolve(requesthandler(req, res, next))
       .catch((err) => {
         // Ensure err has a statusCode and a message
         err.statusCode = err.statusCode || 500;
         err.message = err.message || 'Internal Server Error';
         next(err);
       });
   };
 };
 
 export default asynchandler;
 