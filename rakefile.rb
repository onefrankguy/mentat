require 'rake'

task :default => :test

desc "Makes sure the code isn't to big?"
task :test => :jslint do
  old_size = File.exists?('mentat.zip') ? File.size('mentat.zip') : 0
  sh 'zip -r mentat . -i@manifest.txt'
  new_size = File.size('mentat.zip')
  puts "Old size: #{old_size} bytes (#{percent(old_size)}%)"
  puts "New size: #{new_size} bytes (#{percent(new_size)}%)"
  fail 'Zip file too big!' if new_size > 10 * 1024
end

desc 'Runs JSLint on the code'
task :jslint do
  lint ['document'], 'js/jquery.js'
  lint ['document', 'jQuery'], 'js/dnd.js'
  lint ['document', 'jQuery', 'DragDrop'], 'js/mentat.js'
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
  predefs.map! { |var| "--predef #{var}" }
  predefs = predefs.join(' ')
  sh "jslint --white #{predefs} #{file}"
end

def percent size
  max = 13 * 1024
  (size.to_f / max.to_f * 100).to_i
end
