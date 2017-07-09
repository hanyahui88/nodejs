var gulp=require('gulp');
    htmlmin=require('gulp-htmlmin');
    borwserSync = require('browser-sync').create(),
    reload = borwserSync.reload,
    watch = require('gulp-watch'),
    sass = require('gulp-sass');
    minify = require('gulp-minify');
    cssmin = require('gulp-minify-css');
    clean = require('gulp-clean');
    notify = require('gulp-notify');
    gulpSequence = require('gulp-sequence');
    prefix = require('gulp-autoprefixer');

//定义一个scss任务（自定义任务名称）
gulp.task('scss', function () {
    gulp.src('src/scss/*.scss') //该任务针对的文件
        .pipe(sass({"bundleExec": true}).on('error', sass.logError)) //将scss转换成css
        // .pipe(prefix({
        //     browsers: ['last 2 version', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'],
        //     cascade: true, //是否美化属性值 默认：true 像这样：
        //     //-webkit-transform: rotate(45deg);
        //     //        transform: rotate(45deg);
        //     remove:true})) //是否去掉不必要的前缀 默认：true   prefix 报错
        // .pipe(cssmin()) //压缩css
        .pipe(gulp.dest('build/static/css'))
        .pipe(reload({stream: true})) //重新加载
        .pipe(notify("scss success!!!"));
});
//定义一个js任务（自定义任务名称）
gulp.task('js', function () {
    gulp.src('src/js/*.js') //该任务针对的文件
        .pipe(minify()) //压缩
        .pipe(gulp.dest('build/static/js'))
        .pipe(notify("js success!!!"));
});
//定义一个html任务（自定义任务名称）
gulp.task('html', function () {
    gulp.src('static/*.html') //该任务针对的文件
        .pipe(htmlmin({collapseWhitespace: true})) //压缩
        .pipe(gulp.dest('build/static/html'))
        .pipe(notify("html success!!!"));
});
//监听文件改变
gulp.task('browser-sync',function(){
    borwserSync.init({
         server:{
             baseDir:'./'
         }
     });
    gulp.watch('src/scss/*.scss',['scss']);
    gulp.watch("static/*.html").on('change',reload);
});
//清除以前生成的文件
gulp.task('clean',function(){
    return gulp.src('build',{ read : false})
        .pipe(clean())
        .pipe(notify("clean success!!!"));
})

// gulp.task('default',['clean','scss', 'js','html','browser-sync']); //定义默认任务
//先执行clean，其他的并行执行
gulp.task('default',gulpSequence('clean',['scss', 'js','html','browser-sync'])); //定义默认任务