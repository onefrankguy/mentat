require 'rake'

task :default => :test

desc "Makes sure the code isn't to big?"
task :test => :lint do
  old_size = File.exists?('mentat.zip') ? File.size('mentat.zip') : 0
  sh 'zip -r mentat . -i@manifest.txt'
  new_size = File.size('mentat.zip')
  puts "Old size: #{old_size} bytes (#{percent(old_size)}%)"
  puts "New size: #{new_size} bytes (#{percent(new_size)}%)"
  fail 'Zip file too big!' if new_size > 10 * 1024
end

desc 'Runs JSHint on the code'
task :lint do
  lint ['document'], 'js/jquery.js'
  lint ['document', 'jQuery'], 'js/dnd.js'
  lint ['document', 'jQuery', 'DragDrop'], 'js/mentat.js'
end

begin
  gem 'webrick'
  desc 'Runs a simple web server'
  task :web, :port do |t, args|
    port = args[:port] || '8080'
    src = []
    src << "a = { :Port => #{port}, :DocumentRoot => Dir.pwd }"
    src << 's = WEBrick::HTTPServer.new(a)'
    src << 'trap("INT") { s.shutdown }'
    src << 's.start'
    src = "'" + src.join('; ') + "'"
    ruby "-rwebrick -e #{src}"
  end
rescue Gem::LoadError
end

begin
  gem 'deadweight'
  desc 'Checks for unused CSS selectors.'
  task :deadweight do
    css = Dir['css/*.css']
    css.map! { |file| "-s #{file}" }
    css = css.join(' ')
    sh "deadweight #{css} index.html"
  end
rescue Gem::LoadError
end

def lint predefs, file
  run "jshint #{file}"
end

def percent size
  max = 13 * 1024
  (size.to_f / max.to_f * 100).to_i
end

def run command
  puts command
  output = `#{command}`.strip
  puts output unless output.empty?
end
