require 'rake'

task :default => :test

desc "Makes sure the code isn't to big?"
task :test do
  sh 'zip -r mentat . -i@manifest.txt'
  size = File.size('mentat.zip')
  max = 13 * 1024
  percent = (size.to_f / max.to_f * 100).to_i
  puts "Size: #{size} bytes (#{percent}%)"
  fail 'Zip file too big!' if size > 10 * 1024
end
