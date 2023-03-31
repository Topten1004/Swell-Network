const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryWithDelay = async (
    fn,
    functionType = "Function",
    retries = 3,
    interval = 5000,
    finalErr = Error("Retry failed"),
) => {
    try {
        return await fn();
    } catch (err) {
        console.log(`${functionType} call failed: ${err.message}`);
        console.log(`Retries remaining: ${retries}`);
        if (retries <= 0) {
            return Promise.reject(finalErr);
        }
        await wait(interval);
        return retryWithDelay(fn, functionType, retries - 1, interval, finalErr);
    }
};

module.exports = {
    retryWithDelay
}