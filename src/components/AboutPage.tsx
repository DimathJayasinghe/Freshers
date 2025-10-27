import { Trophy, Users, Target, Award, Mail, MapPin, Phone, Calendar } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

export function AboutPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 mb-6 shadow-xl">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-gray-900 mb-4 bg-gradient-to-r from-blue-900 via-blue-700 to-green-600 bg-clip-text text-transparent">
          About UCSC Sports Meet
        </h1>
        <p className="text-gray-700 max-w-3xl mx-auto text-lg">
          Celebrating athletic excellence, teamwork, and the competitive spirit of University of Colombo School of Computing
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
        <div className="glass-card rounded-2xl p-8 border border-white/30 shadow-xl">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Target className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed">
            To promote physical fitness, healthy competition, and inter-faculty camaraderie through organized sports events. 
            We aim to discover and nurture athletic talent while fostering a spirit of sportsmanship and teamwork among students.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 border border-white/30 shadow-xl">
          <div className="bg-gradient-to-br from-green-500 to-green-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <Award className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-gray-900 mb-4">Our Vision</h2>
          <p className="text-gray-600 leading-relaxed">
            To establish the UCSC Sports Meet as the premier inter-faculty sporting event that showcases excellence in athletics, 
            creates lasting memories, and builds lifelong friendships across all faculties.
          </p>
        </div>
      </div>

      {/* Tournament Information */}
      <div className="glass-card rounded-2xl p-8 border border-white/30 shadow-xl animate-fade-in">
        <h2 className="text-gray-900 mb-6 text-center">Tournament Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white/50 rounded-xl">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">Duration</p>
            <p className="text-gray-600 text-sm">5 Days</p>
          </div>

          <div className="text-center p-4 bg-white/50 rounded-xl">
            <Trophy className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">Sports Events</p>
            <p className="text-gray-600 text-sm">32+ Events</p>
          </div>

          <div className="text-center p-4 bg-white/50 rounded-xl">
            <Users className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">Participants</p>
            <p className="text-gray-600 text-sm">450+ Athletes</p>
          </div>

          <div className="text-center p-4 bg-white/50 rounded-xl">
            <Award className="w-8 h-8 text-orange-600 mx-auto mb-3" />
            <p className="text-gray-900 mb-1">Prizes</p>
            <p className="text-gray-600 text-sm">Trophies & Medals</p>
          </div>
        </div>
      </div>

      {/* Sport Categories */}
      <div className="animate-fade-in">
        <h2 className="text-gray-900 mb-6 text-center">Sport Categories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🏀</div>
              <h3 className="text-gray-900 mb-2">Team Sports</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Cricket (Men's & Women's)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Football (Men's)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Basketball (Men's & Women's)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Volleyball (Men's & Women's)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                Netball (Women's)
              </li>
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🏊</div>
              <h3 className="text-gray-900 mb-2">Swimming Events</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                50m Freestyle
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                100m Freestyle
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                50m Backstroke
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                50m Breaststroke
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                4x50m Relay
              </li>
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-6 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">🏃</div>
              <h3 className="text-gray-900 mb-2">Athletics Events</h3>
            </div>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                100m Sprint
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                400m Race
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                Long Jump
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                Shot Put
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                4x100m Relay
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Participating Faculties */}
      <div className="animate-fade-in">
        <h2 className="text-gray-900 mb-6 text-center">Participating Faculties</h2>
        
        <div className="glass-card rounded-2xl p-8 border border-white/30 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { name: 'Engineering', color: '#3b82f6', short: 'ENG' },
              { name: 'Science', color: '#10b981', short: 'SCI' },
              { name: 'Medicine', color: '#f59e0b', short: 'MED' },
              { name: 'Arts', color: '#8b5cf6', short: 'ART' },
              { name: 'Management', color: '#ec4899', short: 'MGT' }
            ].map((faculty, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 bg-white/50 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3 shadow-lg"
                  style={{ backgroundColor: faculty.color }}
                >
                  <span className="text-white">{faculty.short}</span>
                </div>
                <p className="text-gray-900 text-center text-sm">Faculty of {faculty.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rules & Regulations */}
      <div className="glass-card rounded-2xl p-8 border border-white/30 shadow-xl animate-fade-in">
        <h2 className="text-gray-900 mb-6">Tournament Rules</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              General Rules
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• All participants must be registered students</li>
              <li>• Medical clearance required for all athletes</li>
              <li>• Fair play and sportsmanship are mandatory</li>
              <li>• Decisions of referees and judges are final</li>
              <li>• Proper sports attire must be worn</li>
            </ul>
          </div>

          <div>
            <h3 className="text-gray-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Scoring System
            </h3>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>• 1st Place: Points vary by event</li>
              <li>• 2nd Place: Points vary by event</li>
              <li>• 3rd Place: Points vary by event</li>
              <li>• Participation points awarded</li>
              <li>• Overall champion determined by total points</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="glass-card rounded-2xl p-8 border border-white/30 shadow-xl animate-fade-in">
        <h2 className="text-gray-900 mb-6 text-center">Contact Us</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-4 bg-white/50 rounded-xl">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-900 mb-1">Location</p>
              <p className="text-gray-600 text-sm">UCSC Sports Complex<br />Reid Avenue, Colombo 07</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white/50 rounded-xl">
            <div className="bg-gradient-to-br from-green-500 to-green-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-900 mb-1">Phone</p>
              <p className="text-gray-600 text-sm">+94 11 123 4567<br />+94 77 123 4567</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white/50 rounded-xl">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-gray-900 mb-1">Email</p>
              <p className="text-gray-600 text-sm">sports@ucsc.cmb.ac.lk<br />info@ucsc.cmb.ac.lk</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
