<%*
fastStart = async (filename, delayInSecond) => {
    if (tp.file.exists(filename)) {
        const f = tp.file.find_tfile(filename);
        let plugins = (await app.vault.read(f)).split(/\r?\n/);
        setTimeout(async () => {
            plugins.forEach(async (p) => await app.plugins.enablePlugin(p))
        }, delayInSecond * 1000)
    }
}
await fastStart("FastStart-Plugins-ShortDelay", 4)
await fastStart("FastStart-Plugins-LongDelay", 12)
await fastStart("FastStart-Plugins-LongLongDelay", 40)
%>