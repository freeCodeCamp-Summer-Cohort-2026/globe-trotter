if(process.env.NODE_ENV === 'production') {
    console.error('seed:reset is not allowed in production');
    process.exit(1);
}