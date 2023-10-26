"use strict"
let Caf = require('caffeine-script-runtime');
Caf.defMod(module, () => {return Caf.importInvoke(["merge", "colors", "humanByteSize", "Math", "dirname", "Number", "Object", "Error", "compactFlatten", "objectDiff", "log", "createS3Url", "objectWithout", "Promise", "present", "abs", "round"], [global, require('path'), require('art-standard-lib'), require('art-class-system'), require('./Lib'), {colors: require('colors')}], (merge, colors, humanByteSize, Math, dirname, Number, Object, Error, compactFlatten, objectDiff, log, createS3Url, objectWithout, Promise, present, abs, round) => {let S3C, itemsByKey, summarizeHistogramGroups, summarizeHistogramGroupUnits, S3P; S3C = require('./S3Comprehensions'); itemsByKey = function(itemList, toKey) {let from, into, to, i, temp; return (from = itemList, into = {}, (from != null) ? (to = from.length, i = 0, (() => {while (i < to) {let Key, Size; ({Key, Size} = from[i]); into[(toKey != null) ? toKey(Key) : Key] = Size; temp = i++;}; return temp;})()) : undefined, into);}; summarizeHistogramGroups = ["bytes", "kilobytes", "megabytes", "gigabytes", "terabytes", "petabytes", "exabytes", "zetabytes"]; summarizeHistogramGroupUnits = ["_B", "kB", "mB", "gB", "tB", "pB", "eB", "zB"]; return S3P = Caf.defClass(class S3P extends Object {}, function(S3P, classSuper, instanceSuper) {this.list = (options) => {let list; return S3C.each(merge(options, {returning: list = [], mapList: (l) => {let from, into, to, i, temp; return (from = l, into = list, (from != null) ? (to = from.length, i = 0, (() => {while (i < to) {let v; v = from[i]; into.push(v); temp = i++;}; return temp;})()) : undefined, into);}}));}; this.summarize = (options) => {let summarizeFolders, summary; summarizeFolders = options.summarizeFolders; summary = {size: 0, maxSize: null, minSize: null, maxSizeKey: null, minSizeKey: null, sizeHistogram: {}, folders: summarizeFolders && {}}; return S3C.each(merge(options, {getProgress: () => ([`totalSize: ${Caf.toString(colors.green(`${Caf.toString(humanByteSize(summary.size))}`))}`, `minSize: ${Caf.toString(colors.green(`${Caf.toString(humanByteSize(summary.minSize))}`))}`, `maxSize: ${Caf.toString(colors.green(`${Caf.toString(humanByteSize(summary.maxSize))}`))}`]).join(" "), map: ({Size, Key}) => {let floorSize, logSize, group, groupKey, groupUnit, g, out, folder, temp, temp1, base, into, i1, from, into1, to, i2, temp2, temp3, temp4; floorSize = humanByteSize(Math.pow(2, 1 + (logSize = Math.log(Size) / Math.log(2) | 0)), 0); group = ((temp = summarizeHistogramGroups[groupKey = (logSize + 1) / 10 | 0]) != null ? temp : "big"); groupUnit = summarizeHistogramGroupUnits[groupKey]; g = ((temp1 = (base = summary.sizeHistogram)[group]) != null ? temp1 : base[group] = (into = out = {items: 0, size: 0}, i1 = 0, (() => {while (i1 < 10) {let i; i = i1; out[(1 << i) + groupUnit] = 0; i1++;};})(), into)); g.items += 1; g.size += Size; g[floorSize] = (g[floorSize] | 0) + 1; if (summarizeFolders) {folder = summary.folders; from = dirname(Key).split("/"); into1 = from; if (from != null) {to = from.length; i2 = 0; while (i2 < to) {let subFolder, temp5; subFolder = from[i2]; folder = ((temp5 = folder[subFolder]) != null ? temp5 : folder[subFolder] = {size: 0, files: 0}); folder.size += Size; folder.files++; i2++;};}; into1;}; summary.size += Size; if (((temp2 = Size >= summary.maxSize) != null ? temp2 : Size)) {summary.maxSize = Size; summary.maxSizeKey = Key;}; if (((temp3 = Size <= summary.minSize) != null ? temp3 : Size)) {summary.minSize = Size; summary.minSizeKey = Key;}; return summary.minSize = Math.min(((temp4 = summary.minSize) != null ? temp4 : Size), Size);}})).then((stats) => {let humanize, temp, from, into, temp2; summary.averageSize = summary.size / (((temp = stats.matchingItems) != null ? temp : stats.items)) | 0; if (summarizeFolders) {humanize = (folder) => {let from1, into1, temp1; if (Caf.is(folder.size, Number)) {folder.humanSize = humanByteSize(folder.size);}; return (from1 = folder, into1 = from1, (from1 != null) ? (() => {for (let k in from1) {let subFolder; subFolder = from1[k]; temp1 = (Caf.is(subFolder, Object)) ? humanize(subFolder) : undefined;}; return temp1;})() : undefined, into1);}; humanize(summary.folders);}; return merge(stats, summary, {human: (from = summary, into = {}, (from != null) ? (() => {for (let k1 in from) {let v, k; v = from[k1]; k = k1; temp2 = /size$/i.test(k) ? into[k1] = humanByteSize(v) : undefined;}; return temp2;})() : undefined, into)});});}; this.compare = (options) => {let logToDelete, logToCopy, logToReplace, verbose, toKey, bucket, fromFolder, toBucket, toFolder, stats, counts, bytes; options = S3C.normalizeOptions(options); logToDelete = options.logToDelete; logToCopy = options.logToCopy; logToReplace = options.logToReplace; verbose = options.verbose; toKey = options.toKey; bucket = options.bucket; fromFolder = options.fromFolder; toBucket = options.toBucket; toFolder = options.toFolder; if (!toBucket) {throw new Error("toBucket required");}; return S3C.each(merge([options, {returning: stats = {counts: counts = {needToCopy: 0, needToReplace: 0, needToDelete: 0, missingInTarget: 0, different: 0, replaceSmaller: 0, replaceBigger: 0, same: 0}, bytes: bytes = {needToCopy: 0, needToDelete: 0, needToReplace: 0, needToReplaceWith: 0, same: 0}}}], {getProgress: () => compactFlatten([(counts.same > 0) ? `same: ${Caf.toString(colors.green(`${Caf.toString(counts.same)}(${Caf.toString(humanByteSize(bytes.same))})`))}` : undefined, (counts.needToCopy > 0) ? `toCopy: ${Caf.toString(colors.green(`${Caf.toString(counts.needToCopy)}(${Caf.toString(humanByteSize(bytes.needToCopy))})`))}` : undefined, (counts.needToReplace > 0) ? `toReplace: ${Caf.toString(colors.green(`${Caf.toString(counts.needToReplace)}(${Caf.toString(humanByteSize(bytes.needToReplace))} with ${Caf.toString(humanByteSize(bytes.needToReplaceWith))})`))}` : undefined, (counts.needToDelete > 0) ? `toDelete: ${Caf.toString(colors.green(`${Caf.toString(counts.needToDelete)}(${Caf.toString(humanByteSize(bytes.needToDelete))})`))}` : undefined]).join(" "), compare: true, mapList: (sourceItems, targetItems) => {let reverseKeyMap; reverseKeyMap = toKey && Caf.object(sourceItems, ({Key}) => Key, null, null, ({Key}) => toKey(Key)); return objectDiff(itemsByKey(sourceItems, toKey), itemsByKey(targetItems), (key, sourceValue) => {let fromKey, temp; fromKey = ((temp = Caf.exists(reverseKeyMap) && reverseKeyMap[key]) != null ? temp : key); if (logToCopy || verbose) {log(`aws s3 cp ${Caf.toString(createS3Url(bucket, fromFolder, fromKey))} ${Caf.toString(createS3Url(toBucket, toFolder, key))} # ${Caf.toString(humanByteSize(sourceValue))}`);}; bytes.needToCopy += sourceValue; counts.needToCopy++; return counts.missingInTarget++;}, (key, targetValue) => {if (logToDelete || verbose) {log(`rm ${Caf.toString(createS3Url(toBucket, toFolder, key))} # ${Caf.toString(humanByteSize(targetValue))}`);}; bytes.needToDelete += targetValue; return counts.needToDelete++;}, (key, sourceValue, targetValue) => {let fromKey, temp; fromKey = ((temp = Caf.exists(reverseKeyMap) && reverseKeyMap[key]) != null ? temp : key); if (logToReplace || verbose) {log(`aws s3 cp ${Caf.toString(createS3Url(bucket, fromFolder, fromKey))} ${Caf.toString(createS3Url(toBucket, toFolder, key))} # replace ${Caf.toString(humanByteSize(targetValue))} with ${Caf.toString(humanByteSize(sourceValue))}`);}; counts.different++; counts.needToReplace++; bytes.needToReplace += targetValue; bytes.needToReplaceWith += sourceValue; return (sourceValue > targetValue) ? counts.replaceSmaller++ : counts.replaceBigger++;}, (key, value) => {bytes.same += value; return counts.same++;});}})).then((stats) => {let cleanStats; cleanStats = (s) => Caf.object(s, (v) => (Caf.is(v, Object)) ? cleanStats(v) : v, (v) => v !== 0); return cleanStats(stats);});}; this.copy = (options) => this._copyWrapper(options, (updatedOptions) => S3C.eachPromises(updatedOptions)); this.sync = (options) => this._copyWrapper(options, (options2) => {let copyFile, stats, overwrite, dryrun, pretend, toKey, toBucket, temp; copyFile = options2.map; stats = options2.stats; overwrite = options2.overwrite; dryrun = options2.dryrun; pretend = (undefined !== (temp = options2.pretend)) ? temp : dryrun; toKey = options2.toKey; toBucket = options2.toBucket; stats.toDeleteFiles = 0; stats.toDeleteBytes = 0; stats.toReplaceFiles = 0; stats.toReplaceBytes = 0; stats.toReplaceWithBytes = 0; stats.replacedFiles = 0; stats.replacedBytes = 0; stats.unchangedFiles = 0; stats.unchangedBytes = 0; return S3C.each(merge(objectWithout(options2, "map"), {compare: true, getProgress: (duration) => options2.getProgress(duration) + ` same: ${Caf.toString(colors.green(`${Caf.toString(stats.unchangedFiles)}(${Caf.toString(humanByteSize(stats.unchangedBytes))})`))} toDelete: ${Caf.toString(colors.green(`${Caf.toString(stats.toDeleteFiles)}(${Caf.toString(humanByteSize(stats.toDeleteBytes))})`))}`, mapList: (sourceItems, targetItems) => {let copyPromises, reverseKeyMap; copyPromises = []; reverseKeyMap = toKey && Caf.object(sourceItems, ({Key}) => Key, null, null, ({Key}) => toKey(Key)); objectDiff(itemsByKey(sourceItems, toKey), itemsByKey(targetItems), (key, sourceValue) => {let fromKey, temp1; fromKey = ((temp1 = Caf.exists(reverseKeyMap) && reverseKeyMap[key]) != null ? temp1 : key); return copyPromises.push(copyFile({Key: fromKey, Size: sourceValue}));}, (key, targetValue) => {log(`aws s3 rm s3://${Caf.toString(toBucket)}/${Caf.toString(key)} # you must do this. size: ${Caf.toString(humanByteSize(targetValue))}`); stats.toDeleteBytes += targetValue; return stats.toDeleteFiles++;}, (key, sourceValue, targetValue) => {let fromKey, temp1; fromKey = ((temp1 = Caf.exists(reverseKeyMap) && reverseKeyMap[key]) != null ? temp1 : key); return overwrite ? (log(`# overwriting s3://${Caf.toString(toBucket)}/${Caf.toString(key)} - replacing targetSize: ${Caf.toString(targetValue)} with sourceSize ${Caf.toString(sourceValue)}`), copyPromises.push(copyFile({Key: fromKey, Size: sourceValue})), stats.replacedFiles++, stats.replacedBytes += targetValue) : (log(`# NOT overwriting s3://${Caf.toString(toBucket)}/${Caf.toString(key)} - replacing targetSize: ${Caf.toString(targetValue)} with sourceSize ${Caf.toString(sourceValue)} (use overwrite: true to overwrite)`), stats.toReplaceFiles++, stats.toReplaceBytes += targetValue, stats.toReplaceWithBytes = sourceValue);}, (key, value) => {stats.unchangedBytes += value; return stats.unchangedFiles++;}); return Promise.all(copyPromises);}}));}); this._copyWrapper = (options, eachFunction) => {let s3, toKey, stats, pretend, verbose, copyConcurrency, largeCopyConcurrency, maxQueueSize, copyPwp, largeCopyPwp, largeCopyThreshold, temp; options = S3C.normalizeOptions(options); s3 = (undefined !== (temp = options.s3)) ? temp : require('./Lib/S3'); toKey = options.toKey; stats = options.stats; pretend = options.pretend; verbose = options.verbose; copyConcurrency = options.copyConcurrency; largeCopyConcurrency = options.largeCopyConcurrency; maxQueueSize = options.maxQueueSize; copyPwp = options.copyPwp; largeCopyPwp = options.largeCopyPwp; largeCopyThreshold = options.largeCopyThreshold; stats != null ? stats : stats = {}; stats.copiedBytes = 0; stats.copiedBytesPerSecond = 0; stats.copyingBytesInFlight = 0; stats.copyingBytesStarted = 0; stats.copyingFilesStarted = 0; stats.copiedFiles = 0; if (!(present(options.toBucket) || present(options.toFolder))) {throw new Error("toBucket or toFolder required");}; return eachFunction(merge(options, {stats, throttle: () => copyPwp.queueSize + largeCopyPwp.queueSize >= maxQueueSize, getProgress: (duration) => compactFlatten(["copied", `${Caf.toString(colors.green(`${Caf.toString(stats.copiedFiles)}/${Caf.toString(stats.copyingFilesStarted)} ${Caf.toString(humanByteSize(stats.copiedBytes))}/${Caf.toString(humanByteSize(stats.copyingBytesStarted))}`))}`, colors.blue(`${Caf.toString(humanByteSize(stats.copiedBytesPerSecond = stats.copiedBytes / duration))}/s`), `inFlight: ${Caf.toString(colors.green(humanByteSize(stats.copyingBytesInFlight)))}`, `copyWorkers: ${Caf.toString(colors.green(`${Caf.toString(copyPwp.activeWorkers)} + ${Caf.toString(largeCopyPwp.activeWorkers)}`))}`, (0 < copyPwp.queueSize + largeCopyPwp.queueSize) ? `copyQueue: ${Caf.toString(colors.green(`${Caf.toString(copyPwp.queueSize)} + ${Caf.toString(largeCopyPwp.queueSize)}`))}` : undefined, pretend ? colors.yellow("PRETENDING") : undefined]).join(" "), map: ({Key: key, Size}) => {stats.copyingFilesStarted++; stats.copyingBytesStarted += Size; return ((Size < largeCopyThreshold) ? copyPwp : largeCopyPwp).queue(() => {stats.copyingBytesInFlight += Size; options = merge(s3.extractCommonCopyOptions(options), {pretend, verbose, bucket: options.bucket, toBucket: options.toBucket, toFolder: options.toFolder, key, toKey, largeCopyThreshold, size: Size}); return s3.copy(options).then(() => {stats.copyingBytesInFlight -= Size; stats.copiedFiles++; return stats.copiedBytes += Size;}).catch((error) => {let temp1, temp2; return /NoSuchKey: The specified key does not exist/.test(error.stack) ? (verbose ? log(`skipping because "NoSuchKey: The specified key does not exist": ${Caf.toString(key)} (${Caf.toString(Size)} bytes)`) : undefined, stats.keyDoesNotExistFiles = (((temp1 = stats.keyDoesNotExistFiles) != null ? temp1 : 0)) + 1, stats.keyDoesNotExistBytes = (((temp2 = stats.keyDoesNotExistBytes) != null ? temp2 : 0)) + Size) : (() => {throw error;})();});});}})).then((stats) => {delete stats.copyingBytesInFlight; delete stats.copyingFilesStarted; delete stats.copyingBytesStarted; stats.copiedBytesPerSecond = stats.copiedBytes / stats.duration; return {finalStats: this.getStatsWithHumanByteSizes(stats)};});}; this.getStatsWithHumanByteSizes = function(stats) {return merge(Caf.object(stats, (v) => (Caf.is(v, Number)) ? (abs(v) < 100) ? round(v, .01) : round(v) : v), {human: Caf.object(stats, (stat, key) => humanByteSize(stat), (stat, key) => /byte|size/i.test(key))});};});});});
//# sourceMappingURL=S3P.js.map
