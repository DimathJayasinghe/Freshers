import { Facebook, Instagram, Youtube, Linkedin, Twitter, Globe } from "lucide-react";

export function Footer() {
  const socialLinks = [
    { 
      name: "Facebook", 
      icon: Facebook, 
      url: "https://www.facebook.com/pahasaraucsc",
      color: "hover:text-blue-500"
    },
    { 
      name: "Instagram", 
      icon: Instagram, 
      url: "https://www.instagram.com/pahasaraucsc",
      color: "hover:text-pink-500"
    },
    { 
      name: "YouTube", 
      icon: Youtube, 
      url: "https://www.youtube.com/@pahasaraucsc",
      color: "hover:text-red-500"
    },
    { 
      name: "LinkedIn", 
      icon: Linkedin, 
      url: "https://www.linkedin.com/company/pahasaraucsc",
      color: "hover:text-blue-400"
    },
    { 
      name: "Twitter", 
      icon: Twitter, 
      url: "https://twitter.com/pahasaraucsc",
      color: "hover:text-sky-400"
    },
    { 
      name: "Website", 
      icon: Globe, 
      url: "https://pahasara.ucsc.lk",
      color: "hover:text-green-400"
    }
  ];

  return (
    <footer className="border-t border-red-900/30 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">

        {/* Social Media Links */}
        <div className="pt-4">
          <h3 className="text-white font-bold text-center mb-4">
            Follow Pahasara Media Unit
          </h3>
          <div className="flex justify-center items-center gap-4 md:gap-6 flex-wrap">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-gray-400 ${social.color} transition-colors duration-300 transform hover:scale-110`}
                  aria-label={social.name}
                >
                  <Icon className="w-6 h-6 md:w-7 md:h-7" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-8 pt-6 border-t border-red-900/30">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Pahasara | UCSC Media. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Updating and Developing Body
          </p>
          <p className="text-gray-600 text-xs mt-1">
            #PAHASARAUCSC
          </p>
        </div>
      </div>
    </footer>
  );
}
