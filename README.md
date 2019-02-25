# docker-mysql-monitoring
Simple nodejs http endpoint to monitor database status

### Configuration environment variables

- `MYSQL_HOST`: mysql server hostname. Default `localhost`
- `MYSQL_PORT`: mysql server port. Default `3306`
- `MYSQL_USER`: mysql user. Default `root`
- `MYSQL_PASSWORD`: mysql password. Default `root`
- `ENDPOINT`: endpoint uri
- `QUERY`: sql query to execute. Default `SELECT 1 AS UP`
- `SINGLE_LINE`: whereas result should be serialized as list (false) or single object (true). Default `false`
- `FIELDS`: list of fields that should be retained from query result

### Multiple endpoints configuration
- `ENDPOINT_*`: used to define multiple endpoints. Replace `*`by incremental number
- `QUERY_*`:  used to define multiple endpoints. Replace `*`by incremental number
- `SINGLE_LINE_*`:  used to define multiple endpoints. Replace `*`by incremental number
- `FIELDS_*`:  used to define multiple endpoints. Replace `*`by incremental number
- `MYSQL_HOST_*`: mysql server hostname. Default to `$MYSQL_HOST`. Replace `*`by incremental number
- `MYSQL_PORT_*`: mysql server port. Default to `$MYSQL_PORT`. Replace `*`by incremental number
- `MYSQL_USER_*`: mysql user. Default to `$MYSQL_USER`. Replace `*`by incremental number
- `MYSQL_PASSWORD_*`: mysql password. Default to `$MYSQL_PASSWORD`. Replace `*`by incremental number
