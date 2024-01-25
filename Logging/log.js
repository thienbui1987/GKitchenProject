const winston = require('winston');
const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "../logs/info.log" }),
    ],
  },
  {
    level: "error",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(
        (error) => `${error.timestamp} ${error.level}: ${error.message}`
      )
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: "../logs/error.log" }),
    ],
  }
  );
  /*
const maxsizeTransport = new winston.transports.File({
    level: 'info',
    format: winston.format.printf(info => info.message),
    filename: ('../logs/info.log'), //đường đẫn tạo file
    maxsize: 104857600, // 100MB
  },
  {
    level: 'error',
    format: winston.format.printf(info => info.message),
    filename: ('../logs/error.log'), //đường đẫn tạo file
    maxsize: 104857600, // 100MB
  },
  )
  */
function WriteLogInfo(data)
{
    logger.log("info", data);
    
}

function WriteLogError(data)
{
    logger.log("error",data);
}

module.exports={
    WriteLogInfo,
    WriteLogError
}